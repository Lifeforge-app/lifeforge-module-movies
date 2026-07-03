import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import type { InferOutput } from '@lifeforge/api'
import { useModuleTranslation } from '@lifeforge/localization'
import {
  Button,
  EmptyStateScreen,
  FAB,
  Flex,
  ModuleHeader,
  Scrollbar,
  SearchInput,
  Stack,
  Tabs,
  ViewModeSelector,
  WithQuery,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import MovieGrid from './components/MovieGrid'
import MovieList from './components/MovieList'
import SearchTMDBModal from './modals/SearchTMDBModal'
import ShowTicketModal from './modals/ShowTicketModal'

export type MovieEntry = InferOutput<
  typeof forgeAPI.entries.list
>['entries'][number]

function Movies() {
  const { open } = useModalStore()
  const { t } = useModuleTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const [currentTab, setCurrentTab] = useState<'unwatched' | 'watched'>(
    'unwatched'
  )

  const entriesQuery = useQuery(
    forgeAPI.entries.list
      .input({
        watched: currentTab === 'watched' ? 'true' : 'false'
      })
      .queryOptions()
  )

  useEffect(() => {
    if (!entriesQuery.data) return

    if (searchParams.get('show-ticket')) {
      const target = entriesQuery.data.entries.find(
        entry => entry.id === searchParams.get('show-ticket')
      )

      if (!target) return

      open(ShowTicketModal, {
        entry: target
      })
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, entriesQuery.data])

  const handleOpenTMDBModal = useCallback(() => {
    open(SearchTMDBModal, {})
  }, [entriesQuery.data])

  return (
    <>
      <ModuleHeader
        actionButton={
          <Button
            display={{ base: 'none', md: 'flex' }}
            icon="tabler:plus"
            tProps={{ item: t('items.movie') }}
            onClick={handleOpenTMDBModal}
          >
            new
          </Button>
        }
      />
      <Flex align="center" gap="xs">
        <SearchInput
          debounceMs={300}
          searchTarget="movie"
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <ViewModeSelector
          currentMode={viewMode}
          display={{ base: 'none', md: 'flex' }}
          options={[
            { icon: 'uil:apps', value: 'grid' },
            { icon: 'tabler:list', value: 'list' }
          ]}
          onModeChange={setViewMode}
        />
      </Flex>
      <WithQuery query={entriesQuery}>
        {data => {
          const FinalComponent = viewMode === 'grid' ? MovieGrid : MovieList

          return (
            <Stack direction="column" flex="1" gap="sm">
              <Tabs
                currentTab={currentTab}
                enabled={['unwatched', 'watched']}
                items={[
                  {
                    id: 'unwatched',
                    name: t('tabs.unwatched'),
                    icon: 'tabler:eye-off',
                    amount:
                      currentTab === 'unwatched'
                        ? data.entries.length
                        : data.total - data.entries.length
                  },
                  {
                    id: 'watched',
                    name: t('tabs.watched'),
                    icon: 'tabler:eye',
                    amount:
                      currentTab === 'watched'
                        ? data.entries.length
                        : data.total - data.entries.length
                  }
                ]}
                onTabChange={setCurrentTab}
              />
              {data.entries.length === 0 ? (
                <EmptyStateScreen
                  CTAButtonProps={{
                    onClick: handleOpenTMDBModal,
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
      <FAB visibilityBreakpoint="md" onClick={handleOpenTMDBModal} />
    </>
  )
}

export default Movies
