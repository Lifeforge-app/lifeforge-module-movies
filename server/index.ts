import { forgeRouter } from '@lifeforge/server-utils'

import * as entriesRoutes from './routes/entries'
import * as ticketRoutes from './routes/ticket'
import * as tmdbRoutes from './routes/tmdb'

export default forgeRouter({
  entries: entriesRoutes,
  ticket: ticketRoutes,
  tmdb: tmdbRoutes
})
