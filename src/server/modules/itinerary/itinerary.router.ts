import { InsertItineraryStopSchema } from '@/server/db';
import {itineraryOwnerProcedure, router} from '@/server/trpc';

export const itineraryRoute = router({
  addStop: itineraryOwnerProcedure.input(InsertItineraryStopSchema).mutation(async (opts) => {
    opts.
  })
})
