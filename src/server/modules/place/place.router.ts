import { InsertPlaceSchema } from "@/server/db";
import { publicProcedure, router } from "@/server/trpc";
import * as placeService from "@/server/modules/place/place.service";

export const placeRouter = router({
  createOrUpdate: publicProcedure
    .input(InsertPlaceSchema)
    .mutation(async (opts) => {
      return await placeService.create(opts.input);
    })
});
