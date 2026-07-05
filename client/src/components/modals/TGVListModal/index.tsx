import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { AutoSizer } from 'react-virtualized'

import type { InferOutput } from '@lifeforge/api'
import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  EmptyStateScreen,
  Flex,
  Grid,
  ModalHeader,
  Scrollbar,
  Tabs,
  WithQuery
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import TGVMovieItem from './components/TGVMovieItem'

export type TGVNowShowing = InferOutput<typeof forgeAPI.tgv.list>

function TGVListModal({ onClose }: { onClose: () => void }) {
  const { t } = useModuleTranslation()
  const [tab, setTab] = useState<'nowShowing' | 'comingSoon'>('nowShowing')

  const moviesQuery = useQuery(
    forgeAPI.tgv.list.input({ type: tab }).queryOptions()
  )

  const entriesQuery = useQuery(forgeAPI.entries.list.queryOptions())

  const existingTgvIds = new Set(
    entriesQuery.data?.entries.filter(e => e.tgv_id).map(e => e.tgv_id) ?? []
  )

  return (
    <Flex direction="column" minHeight="70vh" minWidth="70vw">
      <ModalHeader icon="tabler:ticket" title="Browse TGV" onClose={onClose} />
      <Tabs
        currentTab={tab}
        enabled={['nowShowing', 'comingSoon']}
        items={[
          {
            id: 'nowShowing',
            name: t('tabs.nowShowing'),
            icon: 'tabler:ticket'
          },
          {
            id: 'comingSoon',
            name: t('tabs.comingSoon'),
            icon: 'tabler:calendar'
          }
        ]}
        onTabChange={setTab}
      />
      <Flex centered direction="column" flex="1" minHeight="0" mt="md">
        <WithQuery query={moviesQuery}>
          {data => {
            if (data.movies.length === 0) {
              return (
                <Box height="24rem">
                  <EmptyStateScreen
                    icon="tabler:movie-off"
                    message={{
                      id: 'search'
                    }}
                  />
                </Box>
              )
            }

            return (
              <Box flex="1" height="100%" minHeight="0" width="100%">
                <AutoSizer>
                  {({ width, height }) => (
                    <Scrollbar
                      style={{
                        width,
                        height
                      }}
                    >
                      <Grid
                        gap="sm"
                        pb="md"
                        templateCols={{base: 1, sm: "repeat(auto-fill, minmax(20rem, 1fr))"}}
                      >
                        {data.movies.map(movie => (
                          <TGVMovieItem
                            key={movie.itemkey}
                            data={movie}
                            isAdded={existingTgvIds.has(movie.recid)}
                            tab={tab}
                          />
                        ))}
                      </Grid>
                    </Scrollbar>
                  )}
                </AutoSizer>
              </Box>
            )
          }}
        </WithQuery>
      </Flex>
    </Flex>
  )
}

export default TGVListModal
