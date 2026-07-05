import { JSDOM } from 'jsdom'
import z from 'zod'

import { LocationSchema } from '@lifeforge/server-utils'

import forge from '../forge'
import schema from '../schema'
import type { TGVBooking } from '../types/tgvBooking.types'
import type { TGVListing } from '../types/tgvListing.types'

const stripHtml = (html: string) =>
  new JSDOM(html).window.document.body.textContent?.trim() ?? ''

let cachedSession: string | null = null

const tgvLogin = async (email: string, pin: string) => {
  const res = await fetch('https://api.tgv.com.my/api/members/v1/user_login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, pinchars: pin, mobtel: '' })
  })

  if (!res.ok) {
    throw new Error('Login failed')
  }

  const data = await res.json()
  cachedSession = data.results.mvcsessionid

  return cachedSession
}

const TGVResponseSchema = z.object({
  movies: z.array(
    z.object({
      recid: z.string(),
      itemkey: z.string(),
      name: z.string(),
      poster: z.string(),
      genres: z.array(z.string()),
      duration: z.number(),
      overview: z.string(),
      language: z.string(),
      release_date: z.string()
    })
  )
})

export const list = forge
  .query({
    description: 'Fetch movies from TGV Cinemas by type',
    input: {
      query: z.object({
        type: z.enum(['nowShowing', 'comingSoon'])
      })
    },
    output: {
      OK: TGVResponseSchema,
      BAD_REQUEST: z.string()
    }
  })
  .callback(async ({ query: { type }, response }) => {
    const endpoint = type === 'nowShowing' ? 'nowselling' : 'comingsoon'

    const res = await fetch(
      `https://api.tgv.com.my/api/movies/v1/movielist/${endpoint}`
    )

    if (!res.ok) {
      return response.badRequest('Failed to fetch data from TGV')
    }

    const data: TGVListing = await res.json()

    return response.ok({
      movies: data.results.movies.map(movie => {
        const posterAsset = movie.assets?.find(a => a.assetkey === 'poster')

        return {
          recid: movie.recid,
          itemkey: movie.itemkey,
          name: movie.name,
          poster: posterAsset?.extdata?.fileinfo?.fileurl ?? '',
          genres: movie.extdata?.movieinfo?.genre ?? [],
          duration: Number(movie.extdata?.movieinfo?.runtimemins) || 0,
          overview: stripHtml(movie.extdata?.movieinfo?.synopsis ?? ''),
          language: movie.extdata?.movieinfo?.lang ?? '',
          release_date: movie.extdata?.movieinfo?.releasedatemy ?? ''
        }
      })
    })
  })

export const hasCachedSession = forge
  .query({
    description: 'Check if TGV session is cached and valid',
    output: {
      OK: z.boolean()
    }
  })
  .callback(async ({ response }) => {
    if (!cachedSession) {
      return response.ok(false)
    }

    const res = await fetch(
      'https://api.tgv.com.my/api/members/v1/user_sessioncheck',
      {
        headers: { 'x-mvcsession': cachedSession }
      }
    )

    if (!res.ok) {
      cachedSession = null

      return response.ok(false)
    }

    const data = await res.json()

    if (data.results === true) {
      return response.ok(true)
    }

    cachedSession = null

    return response.ok(false)
  })

export const fetchTicket = forge
  .mutation({
    description: 'Fetch TGV booking ticket by movie recid',
    input: {
      body: z.object({
        email: z.string().optional(),
        pin: z.string().optional(),
        tgvId: z.string()
      })
    },
    output: {
      OK: z.union([
        schema.entries
          .pick({
            theatre_location: true,
            theatre_number: true,
            theatre_seat: true,
            theatre_showtime: true,
            ticket_number: true
          })
          .extend({
            theatre_location_coords: LocationSchema.shape.location.nullable()
          }),
        z.literal(false)
      ]),
      BAD_REQUEST: z.string()
    }
  })
  .callback(
    async ({
      pb,
      body: { email, pin, tgvId },
      response,
      core: {
        api: { searchLocations, getAPIKey }
      }
    }) => {
      let sessionId = cachedSession

      if (!sessionId) {
        if (!email || !pin) {
          return response.badRequest(
            'No cached session and email/pin not provided'
          )
        }

        try {
          sessionId = await tgvLogin(email, pin)
        } catch {
          return response.badRequest('Login failed')
        }
      }

      const bookingsRes = await fetch(
        'https://api.tgv.com.my/api/boxoffice/v1/userbookings_get',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-mvcsession': sessionId || ''
          },
          body: JSON.stringify({ startrowindex: 0, maxrows: 100 })
        }
      )

      if (!bookingsRes.ok) {
        return response.badRequest('Failed to fetch bookings')
      }

      const bookingsData: TGVBooking = await bookingsRes.json()
      const booking = bookingsData.results.bookings.find(
        b => b.booking.itemkey === tgvId
      )

      if (!booking) {
        return response.ok(false)
      }

      let location = booking.cinemainfo.name
      let locationCoords: z.infer<typeof LocationSchema.shape.location> | null =
        null

      const gcloudAPIKey = await getAPIKey('gcloud', pb)

      if (gcloudAPIKey) {
        const locSearchResults = await searchLocations(
          gcloudAPIKey,
          `TGV ${location}`
        )

        if (locSearchResults.length) {
          const target = locSearchResults[0]
          location = target.name
          locationCoords = target.location
        }
      }

      return response.ok({
        ticket_number: booking.booking.vistabookingid,
        theatre_seat: booking.tickets
          .flatMap(t => t.seats.map(s => s.name))
          .join(', '),
        theatre_showtime: booking.sessioninfo.sessiondatemy,
        theatre_location: location,
        theatre_location_coords: locationCoords,
        theatre_number: booking.sessioninfo.screenname
      })
    }
  )
