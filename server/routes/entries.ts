import { eq, count as sqlCount } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod'

import { entriesDto } from '@/types/entries.type'

import forge from '../forge'
import { moviesEntries } from '../schema.drizzle'

export const list = forge
  .query({
    description: 'Get all movie entries',
    input: {
      query: z.object({
        watched: z.enum(['true', 'false']).optional()
      })
    },
    output: {
      OK: z.object({
        total: z.number(),
        entries: z.array(entriesDto)
      })
    }
  })
  .callback(async ({ db, query: { watched }, response }) => {
    const rows = await db
      .select()
      .from(moviesEntries)
      .where(
        watched !== undefined
          ? eq(moviesEntries.is_watched, watched === 'true')
          : undefined
      )

    const [totalRow] = await db
      .select({ value: sqlCount() })
      .from(moviesEntries)

    const sorted = [...rows].sort((a, b) => {
      if (a.is_watched !== b.is_watched) {
        return a.is_watched ? 1 : -1
      }

      if (a.is_watched && b.is_watched && a.watch_date && b.watch_date) {
        return b.watch_date.getTime() - a.watch_date.getTime()
      }

      if (
        (a.ticket_number && !b.ticket_number) ||
        (!a.ticket_number && b.ticket_number)
      ) {
        return a.ticket_number ? -1 : 1
      }

      if (a.theatre_showtime && b.theatre_showtime) {
        return a.theatre_showtime.getTime() - b.theatre_showtime.getTime()
      }

      return a.title.localeCompare(b.title)
    })

    return response.ok({
      total: totalRow.value,
      entries: sorted
    })
  })

export const create = forge
  .mutation({
    description: 'Create a movie entry from TMDB',
    input: {
      query: z.object({
        id: z.string()
      }),
      body: z
        .object({
          tgvId: z.string().optional()
        })
        .optional()
    },
    output: {
      CREATED: entriesDto
    }
  })
  .callback(
    async ({
      db,
      query: { id },
      body,
      core: {
        api: { getAPIKey }
      },
      response
    }) => {
      const parsedId = parseInt(id, 10)

      const apiKey = await getAPIKey('tmdb')

      if (!apiKey) {
        return response.badRequest('API key not found')
      }

      const initialData = await db.query.entries.findFirst({
        where: { tmdb_id: parsedId }
      })

      if (initialData) {
        if (body?.tgvId) {
          const [updated] = await db
            .update(moviesEntries)
            .set({ tgv_id: body.tgvId })
            .where(eq(moviesEntries.id, initialData.id))
            .returning()

          return response.created(updated)
        }

        return response.badRequest('Entry already exists')
      }

      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/movie/${parsedId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        }
      )

      if (!tmdbRes.ok) {
        return response.badRequest('Failed to fetch data from TMDB')
      }

      const tmdbData = await tmdbRes.json()

      const [created] = await db
        .insert(moviesEntries)
        .values({
          tmdb_id: tmdbData.id,
          tgv_id: body?.tgvId ?? '',
          title: tmdbData.title,
          original_title: tmdbData.original_title,
          poster: `https://image.tmdb.org/t/p/original${tmdbData.poster_path}`,
          genres: tmdbData.genres.map((genre: { name: string }) => genre.name),
          duration: tmdbData.runtime,
          overview: tmdbData.overview,
          release_date: tmdbData.release_date,
          language: tmdbData.original_language
        })
        .returning()

      return response.created(created)
    }
  )

export const update = forge
  .mutation({
    description: 'Update movie entry with the latest data from TMDB',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), moviesEntries)
      })
    },
    output: {
      OK: entriesDto
    }
  })
  .callback(
    async ({
      db,
      query: { id },
      core: {
        api: { getAPIKey }
      },
      response
    }) => {
      const apiKey = await getAPIKey('tmdb')

      if (!apiKey) {
        return response.badRequest('API key not found')
      }

      const movieEntry = (await db.query.entries.findFirst({
        where: { id }
      }))!

      if (movieEntry.tmdb_id === -1) {
        return response.badRequest('No TMDB ID')
      }

      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/movie/${movieEntry.tmdb_id}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        }
      )

      if (!tmdbRes.ok) {
        return response.badRequest('Failed to fetch data from TMDB')
      }

      const tmdbData = await tmdbRes.json()

      const [updated] = await db
        .update(moviesEntries)
        .set({
          tmdb_id: tmdbData.id,
          title: tmdbData.title,
          original_title: tmdbData.original_title,
          poster: `https://image.tmdb.org/t/p/original${tmdbData.poster_path}`,
          genres: tmdbData.genres.map((genre: { name: string }) => genre.name),
          duration: tmdbData.runtime,
          overview: tmdbData.overview,
          release_date: tmdbData.release_date,
          language: tmdbData.original_language
        })
        .where(eq(moviesEntries.id, id))
        .returning()

      return response.ok(updated)
    }
  )

export const remove = forge
  .mutation({
    description: 'Delete a movie entry',
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
    await db.delete(moviesEntries).where(eq(moviesEntries.id, id))

    return response.noContent()
  })

export const toggleWatchStatus = forge
  .mutation({
    description: 'Toggle watch status of a movie entry',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), moviesEntries)
      })
    },
    output: {
      OK: entriesDto
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    const entry = (await db.query.entries.findFirst({ where: { id } }))!

    const [updated] = await db
      .update(moviesEntries)
      .set({
        is_watched: !entry.is_watched,
        watch_date: !entry.is_watched
          ? (entry.theatre_showtime ?? new Date())
          : null
      })
      .where(eq(moviesEntries.id, id))
      .returning()

    return response.ok(updated)
  })

export const count = forge
  .query({
    description: 'Get watched and unwatched entry counts',
    output: {
      OK: z.object({
        watched: z.number(),
        unwatched: z.number()
      })
    }
  })
  .callback(async ({ db, response }) => {
    const [watched] = await db
      .select({ value: sqlCount() })
      .from(moviesEntries)
      .where(eq(moviesEntries.is_watched, true))

    const [unwatched] = await db
      .select({ value: sqlCount() })
      .from(moviesEntries)
      .where(eq(moviesEntries.is_watched, false))

    return response.ok({
      watched: watched.value,
      unwatched: unwatched.value
    })
  })
