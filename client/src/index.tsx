import { useState } from 'react'

import type { InferOutput } from '@lifeforge/api'
import { FAB, useModalStore } from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import MovieHeader from './components/MovieHeader'
import MovieTab from './components/MovieTab'
import SearchTMDBModal from './components/modals/SearchTMDBModal'

export type MovieEntry = InferOutput<
  typeof forgeAPI.entries.list
>['entries'][number]

function Movies() {
  const { open } = useModalStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <MovieHeader
        searchQuery={searchQuery}
        viewMode={viewMode}
        onSearchChange={setSearchQuery}
        onViewModeChange={setViewMode}
      />
      <MovieTab searchQuery={searchQuery} viewMode={viewMode} />
      <FAB
        visibilityBreakpoint="md"
        onClick={() => open(SearchTMDBModal, {})}
      />
    </>
  )
}

export default Movies
