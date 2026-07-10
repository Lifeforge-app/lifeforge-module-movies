import { useState } from 'react'

import type { InferOutput } from '@lifeforge/api'
import { useModuleTranslation } from '@lifeforge/localization'
import { Flex, ModalHeader, WithTab } from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import TGVMovieList from './components/TGVMovieList'

export type TGVNowShowing = InferOutput<typeof forgeAPI.tgv.list>

function TGVListModal({ onClose }: { onClose: () => void }) {
  const { t } = useModuleTranslation()
  const [tab, setTab] = useState<'nowShowing' | 'comingSoon'>('nowShowing')

  return (
    <Flex direction="column" minHeight="70vh" minWidth="70vw">
      <ModalHeader icon="tabler:ticket" title="Browse TGV" onClose={onClose} />
      <WithTab
        currentTab={tab}
        tabs={[
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
        useNuqs={false}
        onTabChange={setTab}
      >
        {({ TabSelector }) => (
          <>
            <TabSelector />
            <TGVMovieList />
          </>
        )}
      </WithTab>
    </Flex>
  )
}

export default TGVListModal
