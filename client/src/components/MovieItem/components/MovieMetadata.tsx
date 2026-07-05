import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { getLangNameFromCode } from 'language-name-map'

import { Box, Flex, Icon, Text } from '@lifeforge/ui'

import { useMovieItemContext } from '../contexts/MovieItemContext'

dayjs.extend(duration)
dayjs.extend(relativeTime)

function MovieMetadata() {
  const { data } = useMovieItemContext()

  const metadataItems = [
    {
      icon: 'tabler:category',
      label: 'Genres',
      value: (data.genres as string[]).join(', ')
    },
    {
      icon: 'tabler:calendar',
      label: 'Release Date',
      value: data.release_date
        ? dayjs(data.release_date).format('DD MMM YYYY')
        : 'TBA'
    },
    {
      icon: 'tabler:clock',
      label: 'Duration',
      value: dayjs.duration(data.duration, 'minutes').format('H [h] mm [m]')
    },
    {
      icon: 'uil:globe',
      label: 'Language',
      value:
        data.language
          .split(',')
          .map(e => getLangNameFromCode(e.trim())?.name || '')
          .filter(Boolean)
          .join(', ') || data.language
    }
  ]

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
      <Text color="muted" lineClamp={2} mt="xs">
        {data.overview}
      </Text>
      <Flex mt="md" style={{ gap: '1rem 2rem' }} wrap="wrap">
        {metadataItems.map(({ icon, label, value }) => (
          <Box key={label}>
            <Flex align="center" gap="xs" mb="xs">
              <Icon color="muted" icon={icon} />
              <Text color="muted" weight="medium">
                {label}
              </Text>
            </Flex>
            <Text>{value}</Text>
          </Box>
        ))}
      </Flex>
    </>
  )
}

export default MovieMetadata
