import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import {
  Box,
  DateInput,
  Flex,
  ListboxInput,
  ListboxOption,
  ModalHeader,
  Stack,
  TAILWIND_PALETTE,
  Text,
  WithQuery
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import SeatMap from './components/SeatMap'

function ScreeningDetailsModal({
  onClose,
  data: { movieId }
}: {
  onClose: () => void
  data: { movieId: string }
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedArea, setSelectedArea] = useState('all')
  const [selectedCinema, setSelectedCinema] = useState('')
  const [selectedExperience, setSelectedExperience] = useState('')
  const [selectedSession, setSelectedSession] = useState('')

  const datesQuery = useQuery(
    forgeAPI.tgv.getSessionDates.input({ movieId }).queryOptions()
  )

  const dateBounds = useMemo(() => {
    if (!datesQuery.data || datesQuery.data.length === 0) return null

    const sorted = [...datesQuery.data].sort()

    return {
      startDate: new Date(sorted[0]),
      endDate: new Date(sorted[sorted.length - 1])
    }
  }, [datesQuery.data])

  const cinemasQuery = useQuery(
    forgeAPI.tgv.getMovieCinemas
      .input({
        movieId,
        businessDate: selectedDate
          ? dayjs(selectedDate).format('YYYY-MM-DD')
          : ''
      })
      .queryOptions({
        enabled: !!selectedDate
      })
  )

  const sessionsQuery = useQuery(
    forgeAPI.tgv.getMovieSessions
      .input({
        cinemaId: selectedCinema,
        businessDate: selectedDate
          ? dayjs(selectedDate).format('YYYY-MM-DD')
          : '',
        movieId
      })
      .queryOptions({
        enabled: !!selectedCinema
      })
  )

  const logoQuery = useQuery(forgeAPI.tgv.getExperienceLogos.queryOptions())

  const logoMap = useMemo(() => {
    if (!logoQuery.data) return new Map()

    return new Map(logoQuery.data.map(l => [l.key, l]))
  }, [logoQuery.data])

  const experiences = useMemo(() => {
    if (!sessionsQuery.data) return []

    return [...new Set(sessionsQuery.data.map(s => s.experience))]
  }, [sessionsQuery.data])

  const filteredSessions = useMemo(() => {
    if (!sessionsQuery.data) return []
    if (!selectedExperience) return sessionsQuery.data

    return sessionsQuery.data.filter(s => s.experience === selectedExperience)
  }, [sessionsQuery.data, selectedExperience])

  const seatPlanQuery = useQuery(
    forgeAPI.tgv.getSeatPlan
      .input({
        sessionId: selectedSession,
        cinemaId: selectedCinema
      })
      .queryOptions({
        enabled: !!selectedSession
      })
  )

  return (
    <Box minWidth="40vw">
      <ModalHeader
        icon="tabler:movie"
        title="screeningDetails"
        onClose={onClose}
      />
      <Stack gap="sm" mt="lg">
        <WithQuery query={datesQuery}>
          {() => (
            <DateInput
              endDate={dateBounds?.endDate}
              icon="tabler:calendar"
              label="Date"
              startDate={dateBounds?.startDate}
              value={selectedDate}
              onChange={setSelectedDate}
            />
          )}
        </WithQuery>
        {cinemasQuery.isEnabled && (
          <WithQuery query={cinemasQuery}>
            {cinemaData => (
              <>
                <ListboxInput
                  icon="tabler:map-pin"
                  label="Area"
                  renderContent={() =>
                    cinemaData.find(e => e.state === selectedArea)?.label
                  }
                  value={selectedArea}
                  onChange={val => {
                    setSelectedArea(val)

                    if (val !== 'all') {
                      setSelectedCinema('')
                    }
                  }}
                >
                  {cinemaData.map(area => (
                    <ListboxOption
                      key={area.state}
                      label={area.label}
                      value={area.state}
                    />
                  ))}
                </ListboxInput>
                <ListboxInput
                  icon="tabler:building"
                  label="Cinema"
                  renderContent={value => (
                    <Text truncate as="p">
                      {cinemaData
                        .find(a => a.state === selectedArea)
                        ?.cinemas.find(e => e.id === value)?.name ||
                        'Unknown Cimena'}
                    </Text>
                  )}
                  value={selectedCinema}
                  onChange={val => {
                    setSelectedCinema(val)
                    setSelectedExperience('')
                    setSelectedSession('')
                  }}
                >
                  {cinemaData
                    .filter(a => a.state === selectedArea)
                    .flatMap(area =>
                      area.cinemas.map(cinema => (
                        <ListboxOption
                          key={cinema.id}
                          label={cinema.name}
                          value={cinema.id}
                        />
                      ))
                    )}
                </ListboxInput>
              </>
            )}
          </WithQuery>
        )}
        {sessionsQuery.isEnabled && (
          <WithQuery query={sessionsQuery}>
            {() => (
              <>
                <ListboxInput
                  icon="tabler:layout-grid"
                  label="Experience"
                  renderContent={value => {
                    const logo = logoMap.get(value)

                    return (
                      <Flex align="center" gap="sm">
                        {logo?.logoUrl && (
                          <img
                            alt=""
                            src={logo.logoUrl}
                            style={{ height: '1em' }}
                          />
                        )}
                        <Text truncate as="p">
                          {logo?.subject ?? value}
                        </Text>
                      </Flex>
                    )
                  }}
                  value={selectedExperience}
                  onChange={val => {
                    setSelectedExperience(val)
                    setSelectedSession('')
                  }}
                >
                  {experiences.map(exp => (
                    <ListboxOption
                      key={exp}
                      icon={
                        logoMap.get(exp)?.logoUrl ? (
                          <img
                            alt=""
                            src={logoMap.get(exp)!.logoUrl}
                            style={{
                              flexShrink: 0,
                              width: '3em',
                              marginRight: '0.25em'
                            }}
                          />
                        ) : undefined
                      }
                      label={logoMap.get(exp)?.subject ?? exp}
                      value={exp}
                    />
                  ))}
                </ListboxInput>
                {selectedExperience && (
                  <ListboxInput
                    icon="tabler:clock"
                    label="Time"
                    renderContent={value => {
                      const session = filteredSessions.find(
                        s => s.sessionid === value
                      )

                      if (!session) return ''

                      const ratio =
                        session.seatstotal > 0
                          ? session.seatsused / session.seatstotal
                          : 0
                      const color =
                        ratio >= 1
                          ? TAILWIND_PALETTE.red[500]
                          : ratio > 0.5
                            ? TAILWIND_PALETTE.amber[500]
                            : TAILWIND_PALETTE.green[500]

                      return (
                        <Flex align="center" gap="sm">
                          <Box
                            r="full"
                            style={{
                              backgroundColor: color,
                              height: '1em',
                              width: '1em'
                            }}
                          />
                          <Text
                            truncate
                            as="p"
                          >{`${dayjs(session.showtime).format('h:mm A')} — ${session.screenname} (${session.seatsused}/${session.seatstotal})`}</Text>
                        </Flex>
                      )
                    }}
                    value={selectedSession}
                    onChange={setSelectedSession}
                  >
                    {filteredSessions.map(s => {
                      const ratio =
                        s.seatstotal > 0 ? s.seatsused / s.seatstotal : 0
                      const color =
                        ratio >= 1
                          ? TAILWIND_PALETTE.red[500]
                          : ratio > 0.5
                            ? TAILWIND_PALETTE.amber[500]
                            : TAILWIND_PALETTE.green[500]

                      return (
                        <ListboxOption
                          key={s.sessionid}
                          color={color}
                          label={`${dayjs(s.showtime).format('h:mm A')} — ${s.screenname} (${s.seatsused}/${s.seatstotal})`}
                          value={s.sessionid}
                        />
                      )
                    })}
                  </ListboxInput>
                )}
              </>
            )}
          </WithQuery>
        )}
      </Stack>
      {seatPlanQuery.isEnabled && (
        <Box shadow mt="lg" overflow="hidden" r="md">
          <WithQuery query={seatPlanQuery}>
            {seatPlanData => <SeatMap data={seatPlanData} />}
          </WithQuery>
        </Box>
      )}
    </Box>
  )
}

export default ScreeningDetailsModal
