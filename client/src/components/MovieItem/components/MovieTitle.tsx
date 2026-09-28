import dayjs from 'dayjs'

import { Text } from '@lifeforge/ui'

import { useMovieItemContext } from '../contexts/MovieItemContext'

function MovieTitle() {
  const { data } = useMovieItemContext()

  return (
    <>
      <Text color="custom-500" mb="xs" weight="semibold">
        {dayjs(data.release_date).year()}
      </Text>
      <Text as="h1" size="xl" weight="semibold">
        {data.title}
        <Text as="span" color="muted" ml="xs" size="base" weight="medium">
          ({data.original_title})
        </Text>
      </Text>
      <Text color="muted" lineClamp={3} mt="xs">
        {data.overview}
      </Text>
    </>
  )
}

export default MovieTitle
