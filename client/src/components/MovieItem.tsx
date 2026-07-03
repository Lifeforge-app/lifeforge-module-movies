import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useCallback } from 'react'

import type { InferOutput } from '@lifeforge/api'
import { usePromiseLoading } from '@lifeforge/api'
import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  Button,
  Card,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  Flex,
  Icon,
  Text,
  colorWithOpacity,
  toast,
  useModalStore,
  usePersonalization
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import ModifyTicketModal from '../modals/ModifyTicketModal'
import ShowTicketModal from '../modals/ShowTicketModal'

dayjs.extend(duration)
dayjs.extend(relativeTime)

function MovieItem({
  data,
  type
}: {
  data: InferOutput<typeof forgeAPI.entries.list>['entries'][number]
  type: 'grid' | 'list'
}) {
  const queryClient = useQueryClient()
  const { t } = useModuleTranslation()
  const { language } = usePersonalization()
  const { open } = useModalStore()

  const toggleWatchedMutation = useMutation(
    forgeAPI.entries.toggleWatchStatus.input({ id: data.id }).mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: forgeAPI.entries.key })
      },
      onError: () => {
        toast.error('Failed to mark movie as watched.')
      }
    })
  )

  const [toggleWatchedLoading, handleToggleWatched] = usePromiseLoading(() =>
    toggleWatchedMutation.mutateAsync(undefined)
  )

  const updateMovieDataMutation = useMutation(
    forgeAPI.entries.update.input({ id: data.id }).mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: forgeAPI.entries.key })
        toast.success('Movie data updated successfully.')
      },
      onError: () => {
        toast.error('Failed to update movie data.')
      }
    })
  )

  const [updateMovieDataLoading, handleUpdateMovieData] = usePromiseLoading(
    () => updateMovieDataMutation.mutateAsync(undefined)
  )

  const handleShowTicket = useCallback(() => {
    open(ShowTicketModal, { entry: data })
  }, [data, open])

  const handleUpdateTicket = useCallback(() => {
    open(ModifyTicketModal, {
      initialData: data,
      type: data.ticket_number ? 'update' : 'create'
    })
  }, [data])

  const deleteMutation = useMutation(
    forgeAPI.entries.remove.input({ id: data.id }).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: forgeAPI.key })
      },
      onError: () => {
        toast.error('Failed to delete movie entry')
      }
    })
  )

  const handleDeleteTicket = useCallback(() => {
    open(ConfirmationModal, {
      title: 'Delete Movie',
      description: 'Are you sure you want to delete this movie?',
      confirmationButton: 'delete',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(undefined)
      }
    })
  }, [data])

  return (
    <Card
      as="li"
      direction={type === 'grid' ? 'column' : { base: 'column', md: 'row' }}
      gap="md"
    >
      <Box
        bg={{ base: 'bg-200', dark: colorWithOpacity('bg-800', '40%') }}
        overflow="hidden"
        r="md"
        style={{
          width: type === 'grid' ? '100%' : '12rem',
          height: type === 'grid' ? 'auto' : '16.5rem',
          flexShrink: 0,
          maxHeight: '24em',
          position: 'relative',
          isolation: 'isolate'
        }}
      >
        <Icon
          color={{ base: 'bg-300', dark: 'bg-700' }}
          icon="tabler:movie"
          size="4.5em"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: -1
          }}
        />
        <img
          alt=""
          src={`http://image.tmdb.org/t/p/w300/${data.poster}`}
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            borderRadius: '0.375rem'
          }}
        />
      </Box>
      <Flex direction="column" flex="1" width="100%">
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
          <Box>
            <Flex align="center" gap="xs" mb="xs">
              <Icon color="muted" icon="tabler:category" />
              <Text color="muted" weight="medium">
                Genres
              </Text>
            </Flex>
            <Text>{(data.genres as string[]).join(', ')}</Text>
          </Box>
          <Box>
            <Flex align="center" gap="xs" mb="xs">
              <Icon color="muted" icon="tabler:calendar" />
              <Text color="muted" weight="medium">
                Release Date
              </Text>
            </Flex>
            <Text>
              {data.release_date
                ? dayjs(data.release_date).format('DD MMM YYYY')
                : 'TBA'}
            </Text>
          </Box>
          <Box>
            <Flex align="center" gap="xs" mb="xs">
              <Icon color="muted" icon="tabler:clock" />
              <Text color="muted" weight="medium">
                Duration
              </Text>
            </Flex>
            <Text>
              {dayjs.duration(data.duration, 'minutes').format('H [h] mm [m]')}
            </Text>
          </Box>
          <Box>
            <Flex align="center" gap="xs" mb="xs">
              <Icon color="muted" icon="uil:globe" />
              <Text color="muted" weight="medium">
                Language
              </Text>
            </Flex>
            <Text>{data.language}</Text>
          </Box>
          <Box>
            <Flex align="center" gap="xs" mb="xs">
              <Icon color="muted" icon="tabler:flag" />
              <Text color="muted" weight="medium">
                Countries
              </Text>
            </Flex>
            <Flex align="center" gap="sm">
              {(data.countries as string[]).map(
                (country: string, index: number) => (
                  <Flex
                    key={`country-${index}-${country}`}
                    align="center"
                    gap="xs"
                  >
                    <Icon icon={`circle-flags:${country.toLowerCase()}`} />
                    <Text>{country}</Text>
                  </Flex>
                )
              )}
            </Flex>
          </Box>
        </Flex>
        <Flex
          align="end"
          direction={type === 'grid' ? 'column' : { base: 'column', md: 'row' }}
          flex="1"
          gap="xs"
          justify="end"
          mt="lg"
        >
          {!data.is_watched && (
            <Button
              icon="tabler:check"
              loading={toggleWatchedLoading}
              variant="secondary"
              width="100%"
              onClick={handleToggleWatched}
            >
              Mark as Watched
            </Button>
          )}
          {data.ticket_number && (
            <Button
              icon="tabler:ticket"
              variant={data.is_watched ? 'secondary' : 'primary'}
              width="100%"
              onClick={handleShowTicket}
            >
              Show Ticket
            </Button>
          )}
          {data.is_watched && (
            <Flex centered color="muted" gap="sm" width="100%">
              <Icon color="muted" icon="tabler:check" />
              <Text color="muted">
                {t('misc.watched', {
                  date: dayjs(data.watch_date).locale(language).fromNow()
                })}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
      <Box position="absolute" right="1em" top="1em">
        <ContextMenu>
          {data.is_watched && (
            <ContextMenuItem
              icon="tabler:eye-off"
              label="Mark as Unwatched"
              onClick={handleToggleWatched}
            />
          )}
          <ContextMenuItem
            icon="tabler:ticket"
            label={data.ticket_number ? 'Update Ticket' : 'Add Ticket'}
            onClick={handleUpdateTicket}
          />
          <ContextMenuItem
            icon="tabler:refresh"
            label="Update Movie Data"
            loading={updateMovieDataLoading}
            shouldCloseMenuOnClick={false}
            onClick={handleUpdateMovieData}
          />
          <ContextMenuItem
            dangerous
            icon="tabler:trash"
            label="Delete"
            onClick={handleDeleteTicket}
          />
        </ContextMenu>
      </Box>
    </Card>
  )
}

export default MovieItem
