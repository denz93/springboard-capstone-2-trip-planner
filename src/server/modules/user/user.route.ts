import { authProcedure, router } from "@/server/trpc";
import { z } from "zod";
import * as userService from "./user.service";
import { UpdateUserSchema } from "./user.schema";

export const userRouter = router({
  update: authProcedure.input(UpdateUserSchema).mutation(async (opts) => {
    return await userService.update(opts.ctx.user.id, {
      name: opts.input.name
    });
  })
});
