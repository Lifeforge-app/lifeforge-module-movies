import { Box, EmptyStateScreen, Pagination, Stack } from '@lifeforge/ui'

import type { TMDBSearchResults } from '..'
import TMDBResultItem from './TMDBResultItem'

function TMDBResultsList({
  results,
  page,
  setPage,
  onAddToLibrary
}: {
  results: TMDBSearchResults
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  onAddToLibrary: () => Promise<void>
}) {
  if (results === null) {
    return <></>
  }

  if (results.total_results === 0) {
    return (
      <Box height="24rem" mt="lg">
        <EmptyStateScreen
          icon="tabler:search-off"
          message={{
            id: 'search'
          }}
        />
      </Box>
    )
  }

  return (
    <>
      <Pagination
        mb="md"
        mt="lg"
        page={page}
        totalPages={results.total_pages}
        onPageChange={setPage}
      />
      <Stack gap="xs" mt="lg">
        {results.results.map(entry => (
          <TMDBResultItem
            key={entry.id}
            data={entry}
            isAdded={entry.existed}
            onAddToLibrary={onAddToLibrary}
          />
        ))}
      </Stack>
      <Pagination
        mt="md"
        page={page}
        totalPages={results.total_pages}
        onPageChange={setPage}
      />
    </>
  )
}

export default TMDBResultsList
