import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import * as authHelper from './auth.helper'
import { testCleanUp, initData } from '@/server/__tests__/helpers'
import * as jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'secret';

describe('Auth Helper', () => {
  let data: Awaited<ReturnType<typeof initData>>
  beforeEach(async () => {
    await testCleanUp()
    data = await initData()
  })
  test('return null when token empty', async () => {
    const req = new Request('http://localhost')
    req.headers.set('Authorization', '')
    expect(await authHelper.extractUserFromAuthHeader(req)).toBeNull()
  })

  test('return null when Authorization header wrong format "Bearer <token>"', async () => {
    const req = new Request('http://localhost')
    req.headers.set('Authorization', 'Bearer')
    expect(await authHelper.extractUserFromAuthHeader(req)).toBeNull()

    req.headers.set('Authorization', 'this_is_a_token')
    expect(await authHelper.extractUserFromAuthHeader(req)).toBeNull()
  })

  test('return null when token is invalid', async () => {
    const req = new Request('http://localhost')
    req.headers.set('Authorization', 'Bearer this_is_a_token')
    expect(await authHelper.extractUserFromAuthHeader(req)).toBeNull()
  })

  test('return user when token is valid', async () => {
    const token = jwt.sign({ sub: data.users[0].id }, SECRET, {
      algorithm: 'HS512',
      expiresIn: '30m',
      issuer: 'trip-planner',
      audience: 'accesstoken',
    })
    const req = new Request('http://localhost')
    req.headers.set('Authorization', `Bearer ${token}`)
    expect(await authHelper.extractUserFromAuthHeader(req)).toEqual(data.users[0])
  })
})