import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import * as tripService from './trip.service'
import * as itineraryService from '@/server/modules/itinerary/itinerary.service'
import { testCleanUp, initData } from '../../__tests__/helpers'
import { addDays, startOfDay } from 'date-fns'

describe('Trip Service', () => {
  beforeEach(async () => {
    await testCleanUp()
  })
  afterEach(async () => {
    await testCleanUp()
  })

  describe('create', () => {
    let data: Awaited<ReturnType<typeof initData>>
    beforeEach(async () => {
      await testCleanUp()
      data = await initData()
    })

    test('successfully create trip', async () => {
      const trip = await tripService.create({
        name: 'test',
        userId: data.users[0].id,
        itineraryId: data.trips[0].itineraryId
      })
      expect(trip).toEqual({
        name: 'test',
        description: null,
        starDate: null,
        endDate: null,
        groupSize: 1,
        hasChildren: false,
        userId: data.users[0].id,
        itineraryId: data.trips[0].itineraryId,
        id: expect.any(Number),
        createdAt: expect.any(Date),
      })
    })
  })
  describe('update', () => {
    let data: Awaited<ReturnType<typeof initData>>
    beforeEach(async () => {
      await testCleanUp()
      data = await initData()
    })
    test('successfully update trip info', async () => {
      const newStart = startOfDay(new Date())
      const trip = await tripService.update({
        id: data.trips[0].id,
        name: 'test',
        description: 'test',
        starDate: newStart,
        endDate: addDays(newStart, 3),
        groupSize: 2,
        hasChildren: true,
      })
      expect(trip).toEqual({
        ...data.trips[0],
        name: 'test',
        description: 'test',
        starDate: expect.any(Date),
        endDate: expect.any(Date),
        groupSize: 2,
        hasChildren: true,
      })
    })

    test('return undefined to update non exist trip', async () => {
      const trip = await tripService.update({
        id: -1,
        name: 'test',
        description: 'test',
        starDate: new Date(),
        endDate: addDays(new Date(), 3),
        groupSize: 2,
        hasChildren: true,
      })
      expect(trip).toBeUndefined()
    })

  })
  describe('remove', () => {
    let data: Awaited<ReturnType<typeof initData>>
    beforeEach(async () => {
      await testCleanUp()
      data = await initData()
    })
    test('successfully remove trip and private itinerary', async () => {
      const { id } = data.trips[1]
      const trip = await tripService.remove(id)
      expect(trip).toEqual({ id })
      const it = await itineraryService.findOne(data.trips[1].itineraryId ?? -1)
      expect(it).toBeUndefined()
    })
    test('return undefined to remove non exist trip', async () => {
      const trip = await tripService.remove(-1)
      expect(trip).toBeUndefined()
    })
    test('remove trip also remove private itinerary', async () => {
      const trip = data.trips[1]
      await tripService.remove(trip.id)
      const it = await itineraryService.findOne(trip.itineraryId ?? -1)
      expect(it).toBeUndefined()
    })
    test('prevent remove public itinerary', async () => {
      const trip = data.relationTrips[0]

      expect(await tripService.remove(trip.id)).toEqual({ id: trip.id })
      expect(await itineraryService.findOne(trip.itineraryId ?? -1)).not.toBeUndefined()
    })
  })
  describe('findOne', () => {
    let data: Awaited<ReturnType<typeof initData>>
    beforeEach(async () => {
      await testCleanUp()
      data = await initData()
    })
    test('successfully find trip', async () => {
      const trip = await tripService.findOne(data.trips[0].id)
      expect(trip).toEqual(data.trips[0])
    })
    test('return undefined when trip not found', async () => {
      const trip = await tripService.findOne(-1)
      expect(trip).toBeUndefined()
    })
  })
  describe('findByUserId', () => {
    let data: Awaited<ReturnType<typeof initData>>
    beforeEach(async () => {
      await testCleanUp()
      data = await initData()
    })
    test('successfully find trip', async () => {
      const trips = await tripService.findByUserId(data.users[0].id)
      expect(trips).toEqual(data.trips.filter(t => t.userId === data.users[0].id))
    })

  })
})