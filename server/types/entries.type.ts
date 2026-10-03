import { createSelectSchema } from 'drizzle-orm/zod'
import { z } from 'zod'

import { moviesEntries } from '@/schema.drizzle'

export const entriesDto = createSelectSchema(moviesEntries).extend({
  genres: z.array(z.string()),
  theatre_location_coords: z
    .object({ lat: z.number(), lon: z.number() })
    .nullable()
})
