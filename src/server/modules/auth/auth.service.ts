import { InvalidTokenError, UserNotFoundError } from '@/server/modules/auth/auth.error'
import { verify, sign, type Algorithm, type JwtPayload } from 'jsonwebtoken'
import { RefreshToken, db } from '@/server/db'
import { addDays } from 'date-fns'
import { eq, and, gt, gte } from 'drizzle-orm'

const SECRET = process.env.JWT_SECRET || 'secret'
if (process.env.NODE_ENV !== 'production') {
  console.log(`JWT_SECRET: ${SECRET}`)
}
const ALGORITHMS: Algorithm[] = ['HS512']
const ISSUER = 'trip-planner'
const ACCESS_TOKEN_MAX_AGE = '1h'
const REFRESH_TOKEN_MAX_AGE = 30

/**
 * Verify an access token and return userId
 * @param token string
 * @returns userId string
 */
export async function verifyAccessToken(token: string) {
  try {
    const decodedToken = await verify(token, SECRET, {
      algorithms: ALGORITHMS,
      ignoreExpiration: false,
      ignoreNotBefore: false,
      issuer: ISSUER,
      audience: 'accesstoken',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      clockTolerance: 3,
    }) as JwtPayload
    return decodedToken.sub as string
  } catch (err) {
    if (err instanceof Error)
      console.debug(err.message)
    throw new InvalidTokenError()
  }
}

export async function createToken(userId: number) {
  const payload = { sub: userId }
  const accessToken = await sign(payload, SECRET, {
    expiresIn: ACCESS_TOKEN_MAX_AGE,
    notBefore: 0,
    issuer: ISSUER,
    audience: 'accesstoken',
    algorithm: ALGORITHMS[0],
  })
  const refreshToken = await sign(payload, SECRET, {
    expiresIn: REFRESH_TOKEN_MAX_AGE + 'd',
    notBefore: 0,
    issuer: ISSUER,
    audience: 'refreshtoken',
    algorithm: ALGORITHMS[0],
  })
  try {

    await db.insert(RefreshToken)
      .values({
        token: refreshToken,
        userId,
        expiredAt: addDays(new Date(), REFRESH_TOKEN_MAX_AGE),
      })
  } catch (err) {
    if (err instanceof Error)
      console.debug(err.message)
    throw new UserNotFoundError()
  }

  return { accessToken, refreshToken }
}

export async function exchangeToken(refreshToken: string) {

  // quick verify refresh token
  let payload: JwtPayload
  try {
    payload = verify(refreshToken, SECRET, {
      algorithms: ALGORITHMS,
      ignoreExpiration: true,
      ignoreNotBefore: true,
      issuer: ISSUER,
      audience: 'refreshtoken',
      maxAge: REFRESH_TOKEN_MAX_AGE + 'd',
      clockTolerance: 3,
    }) as JwtPayload

  } catch (err) {
    if (err instanceof Error)
      console.debug(err.message)
    throw new InvalidTokenError()
  }

  /**
   * First face-check is done.
   * Now check it with our database.
   * Reason: Avoid middleman attack. Refresh Token should only be used once.
   */
  const token = await db.query.RefreshToken.findFirst({
    where: and(
      eq(RefreshToken.token, refreshToken),
      gte(RefreshToken.expiredAt, new Date()),
      eq(RefreshToken.isActive, true)
    )
  })

  if (!token)
    throw new InvalidTokenError()

  await db.update(RefreshToken)
    .set({ isActive: false })
    .where(eq(RefreshToken.token, token.token))

  return await createToken(token.userId)

}
