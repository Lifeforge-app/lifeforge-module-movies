import type { MovieEntry } from '..'
import { Grid } from '@lifeforge/ui'

import MovieItem from './MovieItem'

function MovieGrid({ data }: { data: MovieEntry[] }) {
  return (
    <Grid
      as="ul"
      gap="sm"
      mb={{ base: '2xl', md: 'lg' }}
      templateCols="repeat(auto-fill,minmax(24rem,1fr))"
    >
      {data.map(item => (
        <MovieItem key={item.id} data={item} type="grid" />
      ))}
    </Grid>
  )
}

export default MovieGrid
