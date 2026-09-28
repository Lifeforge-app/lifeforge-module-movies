import dayjs from 'dayjs'
import { QRCodeSVG } from 'qrcode.react'

import {
  Bordered,
  Box,
  Card,
  Flex,
  Grid,
  Icon,
  ModalHeader,
  Stack,
  Text,
  colorWithOpacity
} from '@lifeforge/ui'

import type { MovieEntry } from '../..'

function ShowTicketModal({
  data: { entry },
  onClose
}: {
  data: {
    entry: MovieEntry | null
  }
  onClose: () => void
}) {
  const details = [
    {
      icon: 'tabler:map-pin',
      label: 'Venue',
      value: entry?.theatre_location || 'N/A'
    },
    {
      icon: 'tabler:calendar',
      label: 'Showtime',
      value: entry?.theatre_showtime
        ? dayjs(entry.theatre_showtime).format('DD MMM YYYY, h:mm a')
        : 'N/A'
    },
    {
      icon: 'tabler:hash',
      label: 'Theatre No.',
      value: entry?.theatre_number || 'N/A'
    },
    {
      icon: 'mdi:love-seat-outline',
      label: 'Seat',
      value: entry?.theatre_seat || 'N/A'
    }
  ]

  return (
    <Box maxWidth={{ lg: '28rem' }}>
      <ModalHeader icon="tabler:ticket" title="ticket.view" onClose={onClose} />
      {entry && (
        <Card mt="lg" overflow="hidden" p="none" width="100%">
          <Box height="10rem" overflow="hidden" position="relative">
            <img
              alt=""
              src={entry.poster}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box
              bg={colorWithOpacity('bg-950', '50%')}
              inset="0"
              position="absolute"
            />
            <Flex
              direction="column"
              inset="0"
              justify="end"
              p="md"
              position="absolute"
            >
              <Text color="custom-500" mb="xs" size="sm" weight="semibold">
                {entry.release_date ? dayjs(entry.release_date).year() : 'N/A'}
              </Text>
              <Text color="bg-50" size="2xl" weight="semibold">
                {entry.title}
              </Text>
            </Flex>
          </Box>
          <Grid gap="md" py="lg" templateCols={2}>
            {details.map(detail => (
              <Stack key={detail.label} gap="xs">
                <Flex align="center" gap="xs">
                  <Icon color="muted" icon={detail.icon} />
                  <Text color="muted" size="sm" weight="medium">
                    {detail.label}
                  </Text>
                </Flex>
                <Text size="lg">{detail.value}</Text>
              </Stack>
            ))}
          </Grid>
          <Bordered borderSide="top" borderStyle="dashed" />
          <Flex align="center" direction="column" gap="sm">
            <Flex
              centered
              shadow
              aspectRatio="1 / 1"
              height="auto"
              maxWidth={{ sm: '10rem' }}
              p="md"
              r="md"
              style={{
                backgroundColor: 'white'
              }}
              width="100%"
            >
              <QRCodeSVG
                style={{ width: '100%', height: '100%' }}
                value={entry.ticket_number}
              />
            </Flex>
            <Text color="muted" mt="md" size="sm" weight="medium">
              Ticket No.
            </Text>
            <Text size="lg" weight="semibold">
              {entry.ticket_number}
            </Text>
          </Flex>
        </Card>
      )}
    </Box>
  )
}

export default ShowTicketModal
