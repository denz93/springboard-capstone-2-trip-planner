import { z } from 'zod'
export const LocalLoginInputSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).refine(arg => arg.match(/^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/), { message: 'Password must contain at least 1 letter, 1 number and be at least 8 characters' }),
})

export const LocalRegisterInputSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().optional(),
  password: z.string().min(8).refine(arg => arg.match(/^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/), { message: 'Password must contain at least 1 letter, 1 number and be at least 8 characters' }),
})