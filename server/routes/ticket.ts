import { eq } from 'drizzle-orm'
import z from 'zod'

import { LocationSchema } from '@lifeforge/server-utils'

import { entriesDto } from '@/types/entries.type'

import forge from '../forge'
import { moviesEntries } from '../schema.drizzle'

export const update = forge
  .mutation({
    description: 'Update ticket information for a movie entry',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), moviesEntries)
      }),
      body: entriesDto
        .pick({
          ticket_number: true,
          theatre_number: true,
          theatre_seat: true
        })
        .extend({
          theatre_showtime: z.string().optional(),
          theatre_location: LocationSchema.optional()
        })
    },
    output: {
      OK: entriesDto
    }
  })
  .callback(async ({ db, query: { id }, body, response }) => {
    const [updated] = await db
      .update(moviesEntries)
      .set({
        ticket_number: body.ticket_number,
        theatre_number: body.theatre_number,
        theatre_seat: body.theatre_seat,
        theatre_showtime: body.theatre_showtime
          ? new Date(body.theatre_showtime)
          : null,
        theatre_location: body.theatre_location?.name ?? '',
        theatre_location_coords: body.theatre_location
          ? {
              lat: body.theatre_location.location.latitude || 0,
              lon: body.theatre_location.location.longitude || 0
            }
          : null
      })
      .where(eq(moviesEntries.id, id))
      .returning()

    return response.ok(updated)
  })

export const clear = forge
  .mutation({
    description: 'Clear ticket information for a movie entry',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), moviesEntries)
      })
    },
    output: {
      NO_CONTENT: true
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    await db
      .update(moviesEntries)
      .set({
        ticket_number: '',
        theatre_location: '',
        theatre_number: '',
        theatre_seat: '',
        theatre_showtime: null
      })
      .where(eq(moviesEntries.id, id))

    return response.noContent()
  })
