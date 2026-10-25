import { Image, colorWithOpacity } from '@lifeforge/ui'

import { useMovieItemContext } from '../contexts/MovieItemContext'

function MoviePoster() {
  const { data, type } = useMovieItemContext()

  return (
    <Image
      alt=""
      aspectRatio="27/40"
      bg={{ base: 'bg-200', dark: colorWithOpacity('bg-800', '40%') }}
      fallback="tabler:movie"
      fit="contain"
      flexShrink="0"
      height={type === 'grid' ? 'auto' : { base: '100%', md: '16.5rem' }}
      overflow="hidden"
      r="md"
      src={data.poster}
      style={{ isolation: 'isolate' }}
      width={type === 'grid' ? '100%' : { base: '100%', md: '12rem' }}
    />
  )
}

export default MoviePoster
