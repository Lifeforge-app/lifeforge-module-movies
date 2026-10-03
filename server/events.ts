import { and, gte, isNotNull, lte } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { type BuiltModuleSchema } from '@lifeforge/drizzle'
import dayjs from 'dayjs'

import * as schema from './schema.drizzle'

type MoviesDb = PostgresJsDatabase<BuiltModuleSchema<typeof schema>>

export default async function getEvents({
  db,
  start,
  end
}: {
  db: MoviesDb
  start: string
  end: string
}) {
  const entries = await db
    .select()
    .from(schema.moviesEntries)
    .where(
      and(
        isNotNull(schema.moviesEntries.theatre_showtime),
        gte(schema.moviesEntries.theatre_showtime, dayjs(start).toDate()),
        lte(schema.moviesEntries.theatre_showtime, dayjs(end).toDate())
      )
    )

  return entries.flatMap(entry => {
    const showtime = entry.theatre_showtime

    if (!showtime) {
      return []
    }

    return [
      {
        id: entry.id,
        type: 'single' as const,
        title: entry.title,
        start: showtime.toISOString(),
        end: dayjs(showtime)
          .add(entry.duration || 0, 'minutes')
          .toISOString(),
        category: '_movie',
        calendar: '',
        location: entry.theatre_location ?? '',
        location_coords: entry.theatre_location_coords ?? { lat: 0, lon: 0 },
        description: `
  ![${entry.title}](${entry.poster})

  ### Movie Description:
  ${entry.overview}

  ### Theatre Number:
  ${entry.theatre_number}

  ### Seat Number:
  ${entry.theatre_seat}
        `,
        reference_link: `/movies?show-ticket=${entry.id}`
      }
    ]
  })
}
