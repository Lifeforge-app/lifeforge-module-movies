import type { InferOutput } from '@lifeforge/api'
import { Box, Card, Flex, Grid } from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import ActionButton from './components/ActionButton'
import ActionMenu from './components/ActionMenu'
import MovieMetadata from './components/MovieMetadata'
import MoviePoster from './components/MoviePoster'
import MovieTitle from './components/MovieTitle'
import MovieItemProvider from './contexts/MovieItemContext'

function MovieItem({
  data,
  type
}: {
  data: InferOutput<typeof forgeAPI.entries.list>['entries'][number]
  type: 'grid' | 'list'
}) {
  return (
    <MovieItemProvider data={data} type={type}>
      <Card as="li" direction={type === 'grid' ? 'column' : 'row'} gap="md">
        {type === 'grid' ? (
          <>
            <MoviePoster />
            <Flex direction="column" flex="1" width="100%">
              <MovieTitle />
              <MovieMetadata />
              <ActionButton />
            </Flex>
          </>
        ) : (
          <Grid
            gapX="md"
            templateCols={{ base: '6rem 1fr', md: '12rem 1fr' }}
            width="100%"
          >
            <Flex
              direction="column"
              gridArea={{ base: '1 / 1 / 2 / 2', md: '1 / 1 / 4 / 2' }}
            >
              <MoviePoster />
            </Flex>
            <Flex
              direction="column"
              gridArea={{ base: '1 / 2 / 2 / 3', md: '1 / 2 / 2 / 3' }}
              pr="3xl"
            >
              <MovieTitle />
            </Flex>
            <Box gridArea={{ base: '2 / 1 / 3 / 3', md: '2 / 2 / 3 / 3' }}>
              <MovieMetadata />
            </Box>
            <Box gridArea={{ base: '3 / 1 / 4 / 3', md: '3 / 2 / 4 / 3' }}>
              <ActionButton />
            </Box>
          </Grid>
        )}
        <ActionMenu />
      </Card>
    </MovieItemProvider>
  )
}

export default MovieItem
