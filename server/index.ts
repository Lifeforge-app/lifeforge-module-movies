import { forgeRouter, writeContractFileToClient } from '@lifeforge/server-utils'

import * as entriesRoutes from './routes/entries'
import * as ticketRoutes from './routes/ticket'
import * as tmdbRoutes from './routes/tmdb'

const routes = forgeRouter({
  entries: entriesRoutes,
  ticket: ticketRoutes,
  tmdb: tmdbRoutes
})

writeContractFileToClient(routes, import.meta.dirname)

export default routes
