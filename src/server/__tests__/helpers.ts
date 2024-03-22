import { db, Trip, User, Itinerary, ItineraryStop, Place, SelectUserSchema, SelectItinerarySchema, SelectItineraryStopSchema } from '@/server/db'
import { faker } from '@faker-js/faker'
import { z } from 'zod';
import { addDays, startOfToday, format, addHours } from 'date-fns';

export async function testCleanUp() {
  await db.delete(Place)
  await db.delete(ItineraryStop)
  await db.delete(Trip)
  await db.delete(Itinerary)
  await db.delete(User)
}

export async function initData() {
  let users = await generateUsers(2)
  let trips = [
    await generateTrip(users[0], 2, true),
    await generateTrip(users[0], 1),
    await generateTrip(users[1], 3),
  ]
  const relationUsers = await db.query.User.findMany({
    with: {
      trips: true
    }
  })
  const relationTrips = await db.query.Trip.findMany({
    with: {
      itinerary: {
        with: {
          stops: true
        }
      }
    }
  })
  return { users, relationUsers, trips, relationTrips }
}

async function generateUsers(size: number) {
  const users = []
  for (let i = 0; i < size; i++) {
    const fakeName = faker.person.fullName()
    const user = await db.insert(User).values({
      name: fakeName,
      email: `${fakeName.replaceAll(' ', '.')}@example.com`.toLowerCase()
    }).returning()
    users.push(user[0])
  }
  return users
}

async function generateTrip(user: z.infer<typeof SelectUserSchema>, days: number = 2, isPublic = false) {
  const itinerary = await generateItinerary(user.id, isPublic, days)

  const start = faker.date.future()
  const trip = await db.insert(Trip).values({
    description: faker.lorem.paragraphs(2),
    name: faker.lorem.sentence(4),
    userId: user.id,
    itineraryId: itinerary.id,
    starDate: start,
    endDate: addDays(start, days)
  }).returning()
  return trip[0]
}

async function generateItinerary(ownerId: number, isPublic: boolean, days: number = 1) {
  // @ts-ignore
  const itinerary: z.infer<typeof SelectItinerarySchema> & { stops: z.infer<typeof SelectItineraryStopSchema>[] } = (await db.insert(Itinerary).values({
    days: days,
    isPublic: isPublic,
    description: faker.lorem.paragraphs(2),
    name: faker.lorem.sentence(),
    ownerId: ownerId
  }).returning())[0]

  const numOfStops = faker.number.int({ min: days, max: days + 2 })
  let startTime = startOfToday()
  const stops = []
  for (let i = 0; i < numOfStops; i++) {
    const interval = faker.number.int({ min: 1, max: 3 })
    const stop = (await db.insert(ItineraryStop).values({
      startTime: format(startTime, 'HH:mm:ss'),
      endTime: format(addHours(startTime, interval), 'HH:mm:ss'),
      name: faker.lorem.sentence(4),
      ordinalDay: (i % days) + 1,
      itineraryId: itinerary.id
    }).returning())[0]
    stops.push(stop)
    startTime = addHours(startTime, interval)
  }
  itinerary.stops = stops
  return itinerary
}

export async function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}