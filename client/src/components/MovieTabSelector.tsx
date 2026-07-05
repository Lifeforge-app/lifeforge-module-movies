import { useModuleTranslation } from '@lifeforge/localization'
import { Tabs } from '@lifeforge/ui'

function MovieTabSelector({
  currentTab,
  total,
  entriesCount,
  onTabChange
}: {
  currentTab: 'unwatched' | 'watched'
  total: number
  entriesCount: number
  onTabChange: (tab: 'unwatched' | 'watched') => void
}) {
  const { t } = useModuleTranslation()

  return (
    <Tabs
      currentTab={currentTab}
      enabled={['unwatched', 'watched']}
      items={[
        {
          id: 'unwatched',
          name: t('tabs.unwatched'),
          icon: 'tabler:eye-off',
          amount:
            currentTab === 'unwatched' ? entriesCount : total - entriesCount
        },
        {
          id: 'watched',
          name: t('tabs.watched'),
          icon: 'tabler:eye',
          amount: currentTab === 'watched' ? entriesCount : total - entriesCount
        }
      ]}
      onTabChange={onTabChange}
    />
  )
}

export default MovieTabSelector
