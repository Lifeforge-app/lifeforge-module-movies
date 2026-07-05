import { useModuleTranslation } from '@lifeforge/localization'
import {
  Button,
  Flex,
  ModuleHeader,
  SearchInput,
  ViewModeSelector,
  useModalStore
} from '@lifeforge/ui'

import SearchTMDBModal from './modals/SearchTMDBModal'

function MovieHeader({
  searchQuery,
  viewMode,
  onSearchChange,
  onViewModeChange
}: {
  searchQuery: string
  viewMode: 'grid' | 'list'
  onSearchChange: (value: string) => void
  onViewModeChange: (mode: 'grid' | 'list') => void
}) {
  const { open } = useModalStore()
  const { t } = useModuleTranslation()

  return (
    <>
      <ModuleHeader
        actionButton={
          <Button
            display={{ base: 'none', md: 'flex' }}
            icon="tabler:plus"
            tProps={{ item: t('items.movie') }}
            onClick={() => open(SearchTMDBModal, {})}
          >
            new
          </Button>
        }
      />
      <Flex align="center" as="header" gap="xs">
        <SearchInput
          debounceMs={300}
          searchTarget="movie"
          value={searchQuery}
          onChange={onSearchChange}
        />
        <ViewModeSelector
          currentMode={viewMode}
          display={{ base: 'none', md: 'flex' }}
          options={[
            { icon: 'uil:apps', value: 'grid' },
            { icon: 'tabler:list', value: 'list' }
          ]}
          onModeChange={onViewModeChange}
        />
      </Flex>
    </>
  )
}

export default MovieHeader
