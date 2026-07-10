import { useQuery } from '@tanstack/react-query'

import { WithQuery, useTabContext } from '@lifeforge/ui'

import { useOpenTicketFromParams } from '@/hooks/useOpenTicketFromParams'
import { forgeAPI } from '@/manifest'

import MovieTab from './MovieTab'

function MovieTabs() {
  const { currentTab } = useTabContext()

  const entriesQuery = useQuery(
    forgeAPI.entries.list
      .input({
        watched: currentTab === 'watched' ? 'true' : 'false'
      })
      .queryOptions()
  )

  useOpenTicketFromParams(entriesQuery.data?.entries ?? [])

  return (
    <WithQuery query={entriesQuery}>
      {data => <MovieTab data={data} />}
    </WithQuery>
  )
}

export default MovieTabs
