import { verifyAccessToken } from './auth.service'
import * as userService from '@/server/modules/user/user.service'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export async function extractUserFromAuthHeader(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader)
    return null
  const token = authHeader.split(' ')[1]
  if (!token)
    return null

  let userId: string | null = null
  try {
    userId = await verifyAccessToken(token)
  } catch (err) {
  }

  if (!userId)
    return null

  const user = await userService.findOne(+userId)
  if (!user)
    return null
  return user
}

/**
 * Create Trpc Context.
 * This function is called for every incoming request
 */
export async function createContext(opts: FetchCreateContextFnOptions) {
  const user = await extractUserFromAuthHeader(opts.req)

  return { user }
}