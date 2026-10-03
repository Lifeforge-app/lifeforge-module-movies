import { type RelationsBuilder } from 'drizzle-orm'
import {
  boolean,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

import { createModuleTable } from '@lifeforge/drizzle'

const pgTable = createModuleTable()

export const moviesEntries = pgTable('entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  tmdb_id: integer('tmdb_id').notNull().default(-1),
  tgv_id: varchar('tgv_id', { length: 255 }).notNull().default(''),
  title: varchar('title', { length: 255 }).notNull().default(''),
  original_title: varchar('original_title', { length: 255 })
    .notNull()
    .default(''),
  poster: varchar('poster', { length: 512 }).notNull().default(''),
  genres: jsonb('genres').$type<string[]>().notNull().default([]),
  duration: integer('duration').notNull().default(0),
  overview: text('overview').notNull().default(''),
  language: varchar('language', { length: 50 }).notNull().default(''),
  release_date: varchar('release_date', { length: 50 }).notNull().default(''),
  watch_date: timestamp('watch_date', { mode: 'date' }),
  ticket_number: varchar('ticket_number', { length: 255 })
    .notNull()
    .default(''),
  theatre_seat: varchar('theatre_seat', { length: 255 }).notNull().default(''),
  theatre_showtime: timestamp('theatre_showtime', { mode: 'date' }),
  theatre_location: varchar('theatre_location', { length: 512 })
    .notNull()
    .default(''),
  theatre_location_coords: jsonb('theatre_location_coords').$type<{
    lat: number
    lon: number
  } | null>(),
  theatre_number: varchar('theatre_number', { length: 255 })
    .notNull()
    .default(''),
  is_watched: boolean('is_watched').notNull().default(false)
})

export const tables = { entries: moviesEntries }

export const relations = (_r: RelationsBuilder<typeof tables>) => ({})
