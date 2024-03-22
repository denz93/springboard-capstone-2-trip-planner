import { LocalLoginInputSchema, LocalRegisterInputSchema } from '@/server/modules/auth/auth.schema';
import { router, publicProcedure } from '@/server/trpc'
import { z } from 'zod';
import * as authService from './auth.service'

export const authRouter = router({
  me: publicProcedure.query(async (opts) => {
    return {
      me: opts.ctx.user
    }
  }),
  loginLocal: publicProcedure
    .input(LocalLoginInputSchema)
    .mutation(async (opts) => {
      const user = await authService.authenticateLocal(opts.input)
      opts.ctx.session.userId = user?.id ?? null
      await opts.ctx.session.save()
      return user
    }),
  registerLocal: publicProcedure
    .input(LocalRegisterInputSchema)
    .mutation(async (opts) => {
      const user = await authService.createAccountLocal(opts.input)
      opts.ctx.session.userId = user?.id ?? null
      await opts.ctx.session.save()
      return user
    }),
  logout: publicProcedure
    .mutation(async (opts) => {
      opts.ctx.session.destroy()
      return true
    })
})