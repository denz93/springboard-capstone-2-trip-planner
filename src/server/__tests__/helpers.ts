import { db, Trip, User, Itinerary, ItineraryStop, Place, SelectUserSchema, SelectItinerarySchema, SelectItineraryStopSchema, Account } from '@/server/db'
import { faker } from '@faker-js/faker'
import { z } from 'zod';
import { addDays, startOfToday, format, addHours } from 'date-fns';
import { authHash } from '../modules/auth/auth.service';
import { GooglePlaceService } from '../modules/place/google/place.service';
import { LatLng, PlaceType1 } from '@googlemaps/google-maps-services-js';
import _ from 'lodash'
import { and, eq } from 'drizzle-orm';

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
    await generateTrip(users[0], "San Francisco", 2, true),
    await generateTrip(users[0], "Seattle", 1),
    await generateTrip(users[0], "San Jose", 5),
    await generateTrip(users[0], "New York City", 4),

    await generateTrip(users[1], "Las Vegas", 3),
    await generateTrip(users[1], "Los Angeles", 4),
    await generateTrip(users[1], "Boston", 5),


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
    const user = (await db.insert(User).values({
      name: fakeName,
      email: `${fakeName.replaceAll(' ', '.')}@example.com`.toLowerCase()
    }).returning())[0]

    await db.insert(Account).values({
      userId: user.id,
      type: "local",
      secret: await authHash("demo123123")
    })
    users.push(user)
  }
  return users
}

async function generateTrip(user: z.infer<typeof SelectUserSchema>, cityName: string, days: number = 2, isPublic = false) {
  const itinerary = await generateItinerary(user.id, isPublic, cityName, days)

  const start = faker.date.future()
  const trip = await db.insert(Trip).values({
    description: faker.word.words({ count: { min: 0, max: 20 } }),
    name: itinerary.name + ' Trip',
    userId: user.id,
    itineraryId: itinerary.id,
    startDate: start,
    endDate: addDays(start, days)
  }).returning()
  return trip[0]
}

async function generateItinerary(ownerId: number, isPublic: boolean, cityName: string, days: number = 1) {
  const city = (await GooglePlaceService.textSearch(cityName))[0]

  let cityPlace = (await db.insert(Place).values({
    address: city.formatted_address ?? '',
    providerPlaceId: city.place_id ?? '',
    provider: 'google',
    name: city.name ?? '',
    lat: city.geometry?.location.lat ?? 0,
    lng: city.geometry?.location.lng ?? 0
  }).onConflictDoNothing().returning())[0]

  if (!cityPlace) {
    cityPlace = await db.query.Place.findFirst({
      where: and(
        eq(Place.providerPlaceId, city.place_id ?? ''),
        eq(Place.provider, 'google')
      )
    }) as any
  }


  // @ts-ignore
  const itinerary: z.infer<typeof SelectItinerarySchema> & { stops: z.infer<typeof SelectItineraryStopSchema>[] } = (await db.insert(Itinerary).values({
    days: days,
    isPublic: isPublic,
    description: faker.word.words({ count: { min: 5, max: 10 } }),
    name: city.name + ' Itinerary',
    ownerId: ownerId,
    placeId: cityPlace.id
  }).returning())[0]


  let startTime = startOfToday()

  const nearbyStops = await GooglePlaceService.nearBySearch(
    { lat: +cityPlace.lat, lng: +cityPlace.lng } as LatLng,
    [PlaceType1.movie_theater, PlaceType1.cafe, PlaceType1.bar, PlaceType1.restaurant][faker.number.int({ min: 0, max: 3 })],
    10000)
  const numOfStops = faker.number.int({ min: days, max: nearbyStops.length })
  const stopPlaces = await db.insert(Place).values(_.uniqBy(nearbyStops, e => JSON.stringify(e.geometry?.location)).slice(0, numOfStops).map(s => ({
    address: s.formatted_address ?? '',
    lat: s.geometry?.location.lat ?? 0,
    lng: s.geometry?.location.lng ?? 0,
    name: s.name ?? '',
    provider: 'google' as 'google',
    providerPlaceId: s.place_id ?? ''
  }))).onConflictDoNothing().returning()

  const stops = []
  for (let i = 0; i < numOfStops; i++) {
    const interval = faker.number.int({ min: 1, max: 6 })
    const stop = (await db.insert(ItineraryStop).values({
      startTime: format(startTime, 'HH:mm:ss'),
      endTime: format(addHours(startTime, interval), 'HH:mm:ss'),
      name: stopPlaces[i % stopPlaces.length].name,
      ordinalDay: (i % days) + 1,
      itineraryId: itinerary.id,
      placeId: stopPlaces[i % stopPlaces.length].id,
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