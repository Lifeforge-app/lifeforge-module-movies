import { useQuery } from '@tanstack/react-query'

import type { InferOutput } from '@lifeforge/api'
import { useModuleTranslation } from '@lifeforge/localization'
import { WithTab, WithViewMode } from '@lifeforge/ui'

import useFilter from '@/hooks/useFilter'
import { forgeAPI } from '@/manifest'

import MovieHeader from './components/MovieHeader'
import MovieTabs from './components/MovieTabs'

export type MovieEntry = InferOutput<
  typeof forgeAPI.entries.list
>['entries'][number]

function Movies() {
  const { t } = useModuleTranslation()
  const { searchQuery, setSearchQuery } = useFilter()

  const {
    data: count = {
      watched: 0,
      unwatched: 0
    }
  } = useQuery(forgeAPI.entries.count.queryOptions())

  return (
    <WithViewMode
      modes={[
        { icon: 'uil:apps', value: 'grid' },
        { icon: 'tabler:list', value: 'list' }
      ]}
      selectorProps={{ display: { base: 'none', md: 'flex' } }}
      useNuqs={false}
    >
      {() => (
        <>
          <MovieHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <WithTab
            tabs={[
              {
                id: 'unwatched',
                name: t('tabs.unwatched'),
                icon: 'tabler:eye-off',
                amount: count.unwatched
              },
              {
                id: 'watched',
                name: t('tabs.watched'),
                icon: 'tabler:eye',
                amount: count.watched
              }
            ]}
          >
            {() => <MovieTabs />}
          </WithTab>
        </>
      )}
    </WithViewMode>
  )
}

export default Movies
