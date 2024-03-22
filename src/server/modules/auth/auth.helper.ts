import { verifyAccessToken } from './auth.service'
import * as userService from '@/server/modules/user/user.service'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { cookies } from 'next/headers'
import { getIronSession, type IronSession } from 'iron-session';

const SESSION_PASSWORD = process.env.SESSION_PASSWORD || ''
const SESSION_NAME = 'iron_session'
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

export async function extractUserFromSession(session: IronSession<{ userId: number | null }>) {
  if (!session.userId) return null
  return await userService.findOne(session.userId) ?? null
}

/**
 * Create Trpc Context.
 * This function is called for every incoming request
 */
export async function createContext(opts: FetchCreateContextFnOptions) {
  let user = await extractUserFromAuthHeader(opts.req)
  const session = await getSession()
  if (!user) {
    user = await extractUserFromSession(session)
  }
  return { user, session }
}

export async function getSession() {
  return await getIronSession<{ userId: number | null }>(cookies(), { password: SESSION_PASSWORD, cookieName: SESSION_NAME })
}