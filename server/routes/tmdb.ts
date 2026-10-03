import { inArray } from 'drizzle-orm'
import z from 'zod'

import forge from '../forge'
import { moviesEntries } from '../schema.drizzle'

const TMDBSearchResultSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string(),
  genre_ids: z.array(z.number()),
  existed: z.boolean(),
  id: z.number(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string(),
  release_date: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number()
})

const TMDBResponseSchema = z.object({
  page: z.number(),
  results: z.array(TMDBSearchResultSchema),
  total_pages: z.number(),
  total_results: z.number()
})

export const search = forge
  .query({
    description: 'Search movies using TMDB API',
    input: {
      query: z.object({
        q: z.string().min(1, 'Query must not be empty'),
        page: z.string().optional().default('1')
      })
    },
    output: {
      OK: TMDBResponseSchema,
    }
  })
  .callback(
    async ({
      db,
      query: { q, page },
      core: {
        api: { getAPIKey }
      },
      response
    }) => {
      const parsedPage = parseInt(page) || 1

      const apiKey = await getAPIKey('tmdb')

      if (!apiKey) {
        return response.badRequest('API key not found')
      }

      const url = `https://api.themoviedb.org/3/search/movie?query=${decodeURIComponent(
        q
      )}&page=${parsedPage}`

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      })

      const tmdbData = await res.json()

      const ids: number[] = tmdbData.results.map(
        (entry: { id: number }) => entry.id
      )

      const existing = ids.length
        ? await db
            .select({ tmdb_id: moviesEntries.tmdb_id })
            .from(moviesEntries)
            .where(inArray(moviesEntries.tmdb_id, ids))
        : []

      const existingIds = new Set(existing.map(entry => entry.tmdb_id))

      tmdbData.results.forEach((entry: any) => {
        entry.existed = existingIds.has(entry.id)
      })

      return response.ok(
        tmdbData as unknown as z.infer<typeof TMDBResponseSchema>
      )
    }
  )
