import z from 'zod'

import forge from '../forge'

export interface TMDBSearchResult {
  adult: boolean
  backdrop_path: string
  genre_ids: number[]
  existed: boolean
  id: number
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string
  release_date: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

export const search = forge
  .query()
  .description('Search movies using TMDB API')
  .input({
    query: z.object({
      q: z.string().min(1, 'Query must not be empty'),
      page: z
        .string()
        .optional()
        .default('1')
        .transform(val => parseInt(val) || 1)
    })
  })
  .callback(
    async ({
      pb,
      query: { q, page },
      core: {
        api: { getAPIKey }
      }
    }) => {
      const apiKey = await getAPIKey('tmdb', pb)

      if (!apiKey) {
        throw new Error('API key not found')
      }

      const url = `https://api.themoviedb.org/3/search/movie?query=${decodeURIComponent(
        q
      )}&page=${page}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }).then(res => res.json())

      const allIds = await pb.getFullList
        .collection('entries')
        .filter([
          {
            combination: '||',
            filters: response.results.map((entry: { id: number }) => ({
              field: 'tmdb_id',
              operator: '=',
              value: entry.id
            }))
          }
        ])
        .execute()

      response.results.forEach((entry: any) => {
        entry.existed = allIds.some(e => e.tmdb_id === entry.id)
      })

      return response as {
        page: number
        results: TMDBSearchResult[]
        total_pages: number
        total_results: number
      }
    }
  )
