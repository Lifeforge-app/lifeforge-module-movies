import z from 'zod'

import forge from '../forge'

export const list = forge
  .query()
  .description('Get all movie entries')
  .input({
    query: z.object({
      watched: z
        .enum(['true', 'false'])
        .optional()
        .default('false')
        .transform(val => (val === 'true' ? true : false))
    })
  })
  .callback(async ({ pb, query: { watched } }) => {
    const entries = await pb.getFullList
      .collection('entries')
      .filter([
        {
          field: 'is_watched',
          operator: '=',
          value: watched
        }
      ])
      .execute()

    const total = (
      await pb.getList.collection('entries').page(1).perPage(1).execute()
    ).totalItems

    return {
      total,
      entries: entries.sort((a, b) => {
        if (a.is_watched !== b.is_watched) {
          return a.is_watched ? 1 : -1 // Unwatched entries come first
        }

        if (
          (a.ticket_number && !b.ticket_number) ||
          (!a.ticket_number && b.ticket_number)
        ) {
          return a.ticket_number ? -1 : 1 // Entries with tickets come first
        }

        if (a.theatre_showtime && b.theatre_showtime) {
          return (
            new Date(a.theatre_showtime).getTime() -
            new Date(b.theatre_showtime).getTime() // Earlier showtimes come first
          )
        }

        return a.title.localeCompare(b.title)
      })
    }
  })

export const create = forge
  .mutation()
  .description('Create a movie entry from TMDB')
  .input({
    query: z.object({
      id: z.string().transform(val => parseInt(val, 10))
    })
  })
  .statusCode(201)
  .callback(
    async ({
      pb,
      query: { id },
      core: {
        api: { getAPIKey }
      }
    }) => {
      const apiKey = await getAPIKey('tmdb', pb)

      if (!apiKey) {
        throw new Error('API key not found')
      }

      const initialData = await pb.getFirstListItem
        .collection('entries')
        .filter([
          {
            field: 'tmdb_id',
            operator: '=',
            value: id
          }
        ])
        .execute()
        .catch(() => null)

      if (initialData) {
        throw new Error('Entry already exists')
      }

      const response = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      })
        .then(res => res.json())
        .catch(err => {
          throw new Error(`Failed to fetch data from TMDB: ${err.message}`)
        })

      const entryData = {
        tmdb_id: response.id,
        title: response.title,
        original_title: response.original_title,
        poster: response.poster_path,
        genres: response.genres.map((genre: { name: string }) => genre.name),
        duration: response.runtime,
        overview: response.overview,
        release_date: response.release_date,
        countries: response.origin_country,
        language: response.original_language
      }

      return await pb.create.collection('entries').data(entryData).execute()
    }
  )

export const update = forge
  .mutation()
  .description('Update movie entry with the latest data from TMDB')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'entries'
  })
  .callback(
    async ({
      pb,
      query: { id },
      core: {
        api: { getAPIKey }
      }
    }) => {
      const apiKey = await getAPIKey('tmdb', pb)

      if (!apiKey) {
        throw new Error('API key not found')
      }

      const movieEntry = await pb.getOne.collection('entries').id(id).execute()

      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieEntry.tmdb_id}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        }
      )
        .then(res => res.json())
        .catch(err => {
          throw new Error(`Failed to fetch data from TMDB: ${err.message}`)
        })

      const entryData = {
        tmdb_id: response.id,
        title: response.title,
        original_title: response.original_title,
        poster: response.poster_path,
        genres: response.genres.map((genre: { name: string }) => genre.name),
        duration: response.runtime,
        overview: response.overview,
        release_date: response.release_date,
        countries: response.origin_country,
        language: response.original_language
      }

      return await pb.update
        .collection('entries')
        .id(id)
        .data(entryData)
        .execute()
    }
  )

export const remove = forge
  .mutation()
  .description('Delete a movie entry')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'entries'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('entries').id(id).execute()
  )

export const toggleWatchStatus = forge
  .mutation()
  .description('Toggle watch status of a movie entry')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'entries'
  })
  .callback(async ({ pb, query: { id } }) => {
    const entry = await pb.getOne.collection('entries').id(id).execute()

    return await pb.update
      .collection('entries')
      .id(id)
      .data({
        is_watched: !entry.is_watched,
        watch_date: !entry.is_watched
          ? entry.theatre_showtime || new Date().toISOString()
          : null
      })
      .execute()
  })
