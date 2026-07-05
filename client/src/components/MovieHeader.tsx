import { Flex, ModuleHeader, SearchInput, ViewModeSelector } from '@lifeforge/ui'

import MovieCreationMenu from './MovieCreationMenu'

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
  return (
    <>
      <ModuleHeader actionButton={<MovieCreationMenu variant="desktop" />} />
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
      <MovieCreationMenu variant="mobile" />
    </>
  )
}

export default MovieHeader
