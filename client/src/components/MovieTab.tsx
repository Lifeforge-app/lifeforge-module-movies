import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import type { InferOutput } from '@lifeforge/api'
import {
  EmptyStateScreen,
  Scrollbar,
  Stack,
  createTabbedView,
  useModalStore
} from '@lifeforge/ui'

import useFilter from '@/hooks/useFilter'
import { forgeAPI } from '@/manifest'
import { ViewModes } from '@/views'

import MovieGrid from '../views/MovieGrid'
import MovieList from '../views/MovieList'
import SearchTMDBModal from './modals/SearchTMDBModal'

export const MovieTabbedView = createTabbedView({
  tabs: [
    {
      id: 'unwatched',
      name: 'tabs.unwatched',
      icon: 'tabler:eye-off'
    },
    {
      id: 'watched',
      name: 'tabs.watched',
      icon: 'tabler:eye'
    }
  ]
})

function MovieTab({
  data
}: {
  data: InferOutput<typeof forgeAPI.entries.list>
}) {
  const { open } = useModalStore()
  const { searchQuery } = useFilter()
  const { currentTab, setAmounts } = MovieTabbedView.useContext()

  const {
    data: count = {
      watched: 0,
      unwatched: 0
    }
  } = useQuery(forgeAPI.entries.count.queryOptions())

  const filteredData = data.entries.filter(entry => {
    const matchesSearch = entry.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())

    const matchesTab =
      currentTab === 'unwatched' ? !entry.is_watched : entry.is_watched

    return matchesSearch && matchesTab
  })

  useEffect(() => {
    setAmounts(count)
  }, [count])

  return (
    <Stack direction="column" flex="1" gap="sm">
      <MovieTabbedView.Selector />
      {data.entries.length === 0 ? (
        <EmptyStateScreen
          CTAButtonProps={{
            onClick: () => open(SearchTMDBModal, {}),
            tProps: { item: t('items.movie') },
            icon: 'tabler:plus',
            children: 'new'
          }}
          icon="tabler:movie-off"
          message={{
            id: 'library'
          }}
        />
      ) : (
        <Scrollbar>
          <ViewModes.When mode="grid">
            <MovieGrid data={filteredData} />
          </ViewModes.When>
          <ViewModes.When mode="list">
            <MovieList data={filteredData} />
          </ViewModes.When>
        </Scrollbar>
      )}
    </Stack>
  )
}

export default MovieTab
