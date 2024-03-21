import { describe, expect, test, beforeEach, afterAll } from 'vitest'
import * as authService from './auth.service'
import { testCleanUp, initData, sleep } from '@/server/__tests__/helpers'
import { InvalidTokenError, UserNotFoundError } from '@/server/modules/auth/auth.error'
import * as jwt from 'jsonwebtoken';
import { db, RefreshToken } from '@/server/db';
import { addDays } from 'date-fns';
import { eq } from 'drizzle-orm';

const SECRET = process.env.JWT_SECRET || 'secret';

describe('Auth Service', () => {
  let data: Awaited<ReturnType<typeof initData>>
  beforeEach(async () => {
    await testCleanUp()
    data = await initData()
  })
  afterAll(async () => {
    await testCleanUp()
  })
  describe('verifyAccessToken', () => {
    test('throw error when token empty', async () => {
      await expect(authService.verifyAccessToken('')).rejects.toThrowError(InvalidTokenError)
    })

    test('throw error when token has invalid aud', async () => {
      const token = jwt.sign({ sub: '123' }, SECRET, {
        algorithm: 'HS512',
        expiresIn: '1h',
        issuer: 'trip-planner',
        audience: 'bad aud',
      })
      await expect(authService.verifyAccessToken(token)).rejects.toThrowError(InvalidTokenError)
    })

    test('throw error when token has invalid iss', async () => {
      const token = jwt.sign({ sub: '123' }, SECRET, {
        algorithm: 'HS512',
        expiresIn: '1h',
        issuer: 'bad iss',
        audience: 'accesstoken',
      })
      await expect(authService.verifyAccessToken(token)).rejects.toThrowError(InvalidTokenError)
    })

    test('throw error when token expired', async () => {
      const token = jwt.sign({ sub: '123', iat: Math.floor(Date.now() / 1000) - 4 }, SECRET, {
        algorithm: 'HS512',
        issuer: 'trip-planner',
        audience: 'accesstoken',
        expiresIn: 1
      })
      await expect(authService.verifyAccessToken(token)).rejects.toThrowError(InvalidTokenError)
    })

    test('successfully verify 3s-tolerance expired token', async () => {
      const token = jwt.sign({ sub: '123', iat: Math.floor(Date.now() / 1000) - 3 }, SECRET, {
        algorithm: 'HS512',
        issuer: 'trip-planner',
        audience: 'accesstoken',
        expiresIn: 1
      })
      expect(await authService.verifyAccessToken(token)).toEqual('123')
    })

    test('successfully verify non expired token', async () => {
      const token = jwt.sign({ sub: '123' }, SECRET, {
        algorithm: 'HS512',
        expiresIn: '1h',
        issuer: 'trip-planner',
        audience: 'accesstoken',
      })
      expect(await authService.verifyAccessToken(token)).toEqual('123')
    })
  })

  describe('createToken', () => {
    test('successfully create token', async () => {
      const { accessToken, refreshToken } = await authService.createToken(data.users[0].id)
      expect(accessToken).toBeDefined()
      expect(refreshToken).toBeDefined()

      const decodedAccessToken = jwt.decode(accessToken)
      expect(decodedAccessToken?.sub).toEqual(data.users[0].id)
      expect(async () => await jwt.verify(accessToken, SECRET)).not.toThrow(
        InvalidTokenError
      )

      const decodedRefreshToken = jwt.decode(refreshToken)
      expect(decodedRefreshToken?.sub).toEqual(data.users[0].id)
      expect(async () => await jwt.verify(refreshToken, SECRET)).not.toThrow(
        InvalidTokenError
      )
    })

    test('throw error when user not found', async () => {
      await expect(authService.createToken(-1)).rejects.toThrowError(UserNotFoundError)
    })
  })

  describe('exchangeToken', () => {
    test('throw error when token empty', async () => {
      await expect(authService.exchangeToken('')).rejects.toThrowError(InvalidTokenError)
    })
    test('throw error when token has invalid aud', async () => {
      const token = jwt.sign({ sub: '123' }, SECRET, {
        algorithm: 'HS512',
        expiresIn: '1h',
        issuer: 'trip-planner',
        audience: 'bad aud',
      })
      await expect(authService.exchangeToken(token)).rejects.toThrowError(InvalidTokenError)
    })
    test('throw error when token has invalid iss', async () => {
      const token = jwt.sign({ sub: '123' }, SECRET, {
        algorithm: 'HS512',
        expiresIn: '1h',
        issuer: 'bad iss',
        audience: 'refreshtoken',
      })
      await expect(authService.exchangeToken(token)).rejects.toThrowError(InvalidTokenError)
    })
    test('throw error when token expired', async () => {
      const token = jwt.sign({ sub: '123', iat: Math.floor(Date.now() / 1000) - 4 }, SECRET, {
        algorithm: 'HS512',
        issuer: 'trip-planner',
        audience: 'refreshtoken',
        expiresIn: 1
      })
      await expect(authService.exchangeToken(token)).rejects.toThrowError(InvalidTokenError)
    })

    test('throw error when refresh token not in database', async () => {
      const refreshToken = jwt.sign({ sub: '123' }, SECRET, {
        algorithm: 'HS512',
        issuer: 'trip-planner',
        audience: 'refreshtoken',
        expiresIn: '10d'
      })
      await expect(authService.exchangeToken(refreshToken)).rejects.toThrowError(InvalidTokenError)
    })

    test('successfully exchange 3s-tolerance expired token', async () => {
      const refreshToken = jwt.sign({ sub: data.users[0].id, iat: Math.floor(Date.now() / 1000) - 3 }, SECRET, {
        algorithm: 'HS512',
        issuer: 'trip-planner',
        audience: 'refreshtoken',
        expiresIn: 1
      })
      await db.insert(RefreshToken).values({
        token: refreshToken,
        userId: data.users[0].id,
        expiredAt: addDays(new Date(), 1),
      })
      const newTokens = await authService.exchangeToken(refreshToken)
      expect(newTokens.accessToken).toBeDefined()
      expect(newTokens.refreshToken).toBeDefined()
      expect(newTokens.refreshToken).not.toEqual(refreshToken)

      // check if old token being invalidated
      const oldToken = await db.query.RefreshToken.findFirst({
        where: eq(RefreshToken.token, refreshToken)
      })
      expect(oldToken).not.toBeUndefined()
      expect(oldToken?.isActive).toBe(false)
    })

    test('successfully exchange token', async () => {
      const refreshToken = jwt.sign({ sub: data.users[0].id }, SECRET, {
        algorithm: 'HS512',
        issuer: 'trip-planner',
        audience: 'refreshtoken',
        expiresIn: '10d'
      })
      await db.insert(RefreshToken).values({
        token: refreshToken,
        userId: data.users[0].id,
        expiredAt: addDays(new Date(), 10),
      })
      const newTokens = await authService.exchangeToken(refreshToken)
      expect(newTokens.accessToken).toBeDefined()
      expect(newTokens.refreshToken).toBeDefined()
      expect(newTokens.refreshToken).not.toEqual(refreshToken)
    })
  })
})