import z from 'zod'

import forge from '../forge'
import movieSchemas from '../schema'

export const list = forge
  .query({
    description: 'Get all movie entries',
    input: {
      query: z.object({
        watched: z.enum(['true', 'false']).optional().default('false')
      })
    },
    output: {
      OK: z.object({
        total: z.number(),
        entries: z.array(movieSchemas.entries)
      })
    }
  })
  .callback(async ({ pb, query: { watched }, response }) => {
    const parsedWatched = watched === 'true' ? true : false

    const entries = await pb.getFullList
      .collection('entries')
      .filter([
        {
          field: 'is_watched',
          operator: '=',
          value: parsedWatched
        }
      ])
      .execute()

    const total = (
      await pb.getList.collection('entries').page(1).perPage(1).execute()
    ).totalItems

    return response.ok({
      total,
      entries: entries.sort((a, b) => {
        if (a.is_watched !== b.is_watched) {
          return a.is_watched ? 1 : -1
        }

        if (
          (a.ticket_number && !b.ticket_number) ||
          (!a.ticket_number && b.ticket_number)
        ) {
          return a.ticket_number ? -1 : 1
        }

        if (a.theatre_showtime && b.theatre_showtime) {
          return (
            new Date(a.theatre_showtime).getTime() -
            new Date(b.theatre_showtime).getTime()
          )
        }

        return a.title.localeCompare(b.title)
      })
    })
  })

export const create = forge
  .mutation({
    description: 'Create a movie entry from TMDB',
    input: {
      query: z.object({
        id: z.string()
      })
    },
    output: {
      CREATED: movieSchemas.entries,
      BAD_REQUEST: z.string()
    }
  })
  .callback(
    async ({
      pb,
      query: { id },
      core: {
        api: { getAPIKey }
      },
      response
    }) => {
      const parsedId = parseInt(id, 10)

      const apiKey = await getAPIKey('tmdb', pb)

      if (!apiKey) {
        return response.badRequest('API key not found')
      }

      const initialData = await pb.getFirstListItem
        .collection('entries')
        .filter([
          {
            field: 'tmdb_id',
            operator: '=',
            value: parsedId
          }
        ])
        .execute()
        .catch(() => null)

      if (initialData) {
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

      const entryData = {
        tmdb_id: tmdbData.id,
        title: tmdbData.title,
        original_title: tmdbData.original_title,
        poster: tmdbData.poster_path,
        genres: tmdbData.genres.map((genre: { name: string }) => genre.name),
        duration: tmdbData.runtime,
        overview: tmdbData.overview,
        release_date: tmdbData.release_date,
        countries: tmdbData.origin_country,
        language: tmdbData.original_language
      }

      return response.created(
        await pb.create.collection('entries').data(entryData).execute()
      )
    }
  )

export const update = forge
  .mutation({
    description: 'Update movie entry with the latest data from TMDB',
    input: {
      query: z.object({
        id: z.string()
      })
    },
    existenceCheck: {
      query: { id: 'entries' }
    },
    output: {
      OK: movieSchemas.entries,
      BAD_REQUEST: z.string(),
      NOT_FOUND: true
    }
  })
  .callback(
    async ({
      pb,
      query: { id },
      core: {
        api: { getAPIKey }
      },
      response
    }) => {
      const apiKey = await getAPIKey('tmdb', pb)

      if (!apiKey) {
        return response.badRequest('API key not found')
      }

      const movieEntry = await pb.getOne.collection('entries').id(id).execute()

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

      const entryData = {
        tmdb_id: tmdbData.id,
        title: tmdbData.title,
        original_title: tmdbData.original_title,
        poster: tmdbData.poster_path,
        genres: tmdbData.genres.map((genre: { name: string }) => genre.name),
        duration: tmdbData.runtime,
        overview: tmdbData.overview,
        release_date: tmdbData.release_date,
        countries: tmdbData.origin_country,
        language: tmdbData.original_language
      }

      return response.ok(
        await pb.update
          .collection('entries')
          .id(id)
          .data(entryData)
          .execute()
      )
    }
  )

export const remove = forge
  .mutation({
    description: 'Delete a movie entry',
    input: {
      query: z.object({
        id: z.string()
      })
    },
    existenceCheck: {
      query: { id: 'entries' }
    },
    output: {
      NO_CONTENT: true,
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, query: { id }, response }) => {
    await pb.delete.collection('entries').id(id).execute()

    return response.noContent()
  })

export const toggleWatchStatus = forge
  .mutation({
    description: 'Toggle watch status of a movie entry',
    input: {
      query: z.object({
        id: z.string()
      })
    },
    existenceCheck: {
      query: { id: 'entries' }
    },
    output: {
      OK: movieSchemas.entries,
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, query: { id }, response }) => {
    const entry = await pb.getOne.collection('entries').id(id).execute()

    return response.ok(
      await pb.update
        .collection('entries')
        .id(id)
        .data({
          is_watched: !entry.is_watched,
          watch_date: !entry.is_watched
            ? entry.theatre_showtime || new Date().toISOString()
            : null
        })
        .execute()
    )
  })
