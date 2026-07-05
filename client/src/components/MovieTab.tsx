import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  EmptyStateScreen,
  Scrollbar,
  Stack,
  WithQuery,
  useModalStore
} from '@lifeforge/ui'

import { useOpenTicketFromParams } from '@/hooks/useOpenTicketFromParams'
import { forgeAPI } from '@/manifest'

import MovieGrid from './MovieGrid'
import MovieList from './MovieList'
import MovieTabSelector from './MovieTabSelector'
import SearchTMDBModal from './modals/SearchTMDBModal'

function MovieTab({
  viewMode,
  searchQuery
}: {
  viewMode: 'grid' | 'list'
  searchQuery: string
}) {
  const { t } = useModuleTranslation()
  const { open } = useModalStore()

  const [currentTab, onTabChange] = useState<'unwatched' | 'watched'>(
    'unwatched'
  )

  const entriesQuery = useQuery(
    forgeAPI.entries.list
      .input({
        watched: currentTab === 'watched' ? 'true' : 'false'
      })
      .queryOptions()
  )

  useOpenTicketFromParams(entriesQuery.data?.entries ?? [])

  return (
    <WithQuery query={entriesQuery}>
      {data => {
        const FinalComponent = viewMode === 'grid' ? MovieGrid : MovieList

        return (
          <Stack direction="column" flex="1" gap="sm">
            <MovieTabSelector
              currentTab={currentTab}
              entriesCount={data.entries.length}
              total={data.total}
              onTabChange={onTabChange}
            />
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
                <FinalComponent
                  data={data.entries.filter(entry => {
                    const matchesSearch = entry.title
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())

                    const matchesTab =
                      currentTab === 'unwatched'
                        ? !entry.is_watched
                        : entry.is_watched

                    return matchesSearch && matchesTab
                  })}
                />
              </Scrollbar>
            )}
          </Stack>
        )
      }}
    </WithQuery>
  )
}

export default MovieTab
