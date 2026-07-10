import { t } from 'i18next'

import type { InferOutput } from '@lifeforge/api'
import {
  EmptyStateScreen,
  Scrollbar,
  Stack,
  useModalStore,
  useTabContext,
  useViewModeContext
} from '@lifeforge/ui'

import useFilter from '@/hooks/useFilter'
import { forgeAPI } from '@/manifest'

import MovieGrid from '../views/MovieGrid'
import MovieList from '../views/MovieList'
import SearchTMDBModal from './modals/SearchTMDBModal'

function MovieTab({
  data
}: {
  data: InferOutput<typeof forgeAPI.entries.list>
}) {
  const { open } = useModalStore()
  const { View } = useViewModeContext<'grid' | 'list'>()
  const { searchQuery } = useFilter()
  const { TabSelector, currentTab } = useTabContext()

  const filteredData = data.entries.filter(entry => {
    const matchesSearch = entry.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())

    const matchesTab =
      currentTab === 'unwatched' ? !entry.is_watched : entry.is_watched

    return matchesSearch && matchesTab
  })

  return (
    <Stack direction="column" flex="1" gap="sm">
      <TabSelector />
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
          <View mode="grid">
            <MovieGrid data={filteredData} />
          </View>
          <View mode="list">
            <MovieList data={filteredData} />
          </View>
        </Scrollbar>
      )}
    </Stack>
  )
}

export default MovieTab
