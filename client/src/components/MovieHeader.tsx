import {
  Box,
  ContextMenu,
  Flex,
  ModuleHeader,
  SearchInput,
  useViewModeContext
} from '@lifeforge/ui'

import MovieCreationMenu from './MovieCreationMenu'

function MovieHeader({
  searchQuery,
  onSearchChange
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
}) {
  const { ViewModeSelector, ViewModeContextMenuSelector } = useViewModeContext()

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
        <ViewModeSelector />
        <Box display={{ base: 'block', md: 'none' }}>
          <ContextMenu>
            <ViewModeContextMenuSelector />
          </ContextMenu>
        </Box>
      </Flex>
      <MovieCreationMenu variant="mobile" />
    </>
  )
}

export default MovieHeader
