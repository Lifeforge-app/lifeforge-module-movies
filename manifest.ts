import { lazy } from 'react'
import type { ModuleConfig } from 'shared'

export default {
  name: 'Movies',
  icon: 'tabler:movie',
  routes: {
    '/': lazy(() => import('@'))
  },
  apiAccess: [
    { key: 'tmdb', required: true, usage: 'Fetch movie data from TMDB' }
  ],
  category: 'Lifestyle'
} satisfies ModuleConfig
