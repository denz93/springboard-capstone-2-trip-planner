import {test, expect, beforeEach, describe, afterEach, afterAll} from 'vitest'
import * as userSerice from './user.service'
import {testCleanUp, initData} from '../../__tests__/helpers'

describe('User Service', () => {
  beforeEach(async () => {
    await testCleanUp()
  })
  afterEach(async () => {
    await testCleanUp()
  })
  afterAll(async () => {
    await testCleanUp()
  })
  
  describe('create', () => {
    test('successfully create user', async () => {
      const user = await userSerice.createUser({
        name: 'test',
        email: 'test',
      })
      expect(user).toEqual({
        name: 'test',
        email: 'test',
        id: expect.any(Number),
        createdAt: expect.any(Date),
      })
    })
    
    test('fail to create duplicate user', async () => {
      await userSerice.createUser({
        name: 'test',
        email: 'test',
      })
      await expect(userSerice.createUser({
        name: 'test',
        email: 'test',
      })).rejects.toThrowError()
    })
  
  })

  describe('findOne', async () => {
    let users: Awaited<ReturnType<typeof initData>>['users']
    beforeEach(async () => {
      await testCleanUp()
      users = (await initData()).users
    })
    test('successfully find user', async () => {
      const user = await userSerice.findOne(users[0].id)
      expect(user).toEqual(users[0])
    })
    test('return undefined when user not found', async () => {
      const user = await userSerice.findOne(-1)
      expect(user).toBeUndefined()
    })
  })

  describe('findByEmail', async () => {
    let users: Awaited<ReturnType<typeof initData>>['users']
    beforeEach(async () => {
      await testCleanUp()
      users = (await initData()).users
    })
    test('successfully find user', async () => {
      const user = await userSerice.findByEmail(users[0].email)
      expect(user).toEqual(users[0])
    })
    test('return undefined when user not found', async () => {
      const user = await userSerice.findByEmail('test')
      expect(user).toBeUndefined()
    })
  })

})

