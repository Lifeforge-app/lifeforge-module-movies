import { LocationSchema } from '@lifeforge/server-utils'
import z from 'zod'

import forge from '../forge'
import moviesSchemas from '../schema'

export const update = forge
  .mutation()
  .description('Update ticket information for a movie entry')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: moviesSchemas.entries
      .pick({
        ticket_number: true,
        theatre_number: true,
        theatre_seat: true
      })
      .extend({
        theatre_showtime: z.string().optional(),
        theatre_location: LocationSchema.optional()
      })
  })
  .existenceCheck('query', {
    id: 'entries'
  })
  .callback(({ pb, query: { id }, body }) => {
    const finalData = {
      ...body,
      theatre_location: body.theatre_location?.name,
      theatre_location_coords: {
        lat: body.theatre_location?.location.latitude || 0,
        lon: body.theatre_location?.location.longitude || 0
      }
    }

    return pb.update.collection('entries').id(id).data(finalData).execute()
  })

export const clear = forge
  .mutation()
  .description('Clear ticket information for a movie entry')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'entries'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.update
      .collection('entries')
      .id(id)
      .data({
        ticket_number: '',
        theatre_location: '',
        theatre_number: '',
        theatre_seat: '',
        theatre_showtime: ''
      })
      .execute()
  )
