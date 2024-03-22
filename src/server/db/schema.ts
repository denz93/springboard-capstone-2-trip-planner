import { jsonb, integer, pgEnum, pgTable, serial, uniqueIndex, varchar, date, boolean, timestamp, check, time, text } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod'

export const MapProviderEnum = pgEnum('map_provider', ['google', 'here']);
export const AccountEnum = pgEnum('account_type', ['local', 'google'])
export const User = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqueEmail: uniqueIndex('unique_email').on(t.email),
}))

export const Account = pgTable('accounts', {
  type: AccountEnum('type'),
  userId: integer('user_id').references(() => User.id, { onDelete: 'cascade' }),
  secret: varchar('value'),
  metadata: jsonb('metadata')
})
export const Trip = pgTable('trips', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  starDate: date('star_date', { mode: 'date' }),
  endDate: date('end_date', { mode: 'date' }),
  groupSize: integer('group_size').default(1),
  hasChildren: boolean('has_children').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  userId: integer('user_id').references(() => User.id, { onDelete: 'cascade' }),
  itineraryId: integer('itinerary_id').references(() => Itinerary.id, { onDelete: 'set null' }),
})

export const Itinerary = pgTable('itineraries', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  days: integer('days').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  ownerId: integer('owner_id').references(() => User.id, { onDelete: 'set null' }),
  placeId: integer('place_id').references(() => Place.id, { onDelete: 'set null' })
}, (t) => ({
  nonNegativeDayConstraint: check('days', sql`> 0`)
}))

export const ItineraryStop = pgTable('itinerary_stops', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ordinalDay: integer('ordinal_day').notNull(),
  startTime: time('start_time', { withTimezone: false }).notNull(),
  endTime: time('end_time', { withTimezone: false }).notNull(),
  itineraryId: integer('itinerary_id').references(() => Itinerary.id, { onDelete: 'cascade' }),
  placeId: integer('place_id').references(() => Place.id, { onDelete: 'set null' })
}, (t) => ({
  endDateConstraint: check(t.endTime.name, sql`> ${t.startTime.name}`)
}))

export const Place = pgTable('places', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 1000 }).notNull(),
  imageUrl: text('image_url'),
  lat: varchar('lat', { length: 255 }).notNull(),
  lng: varchar('lng', { length: 255 }).notNull(),
  provider: MapProviderEnum('provider').notNull(),
  providerPlaceId: varchar('provider_place_id', { length: 255 }).notNull(),
}, (t) => ({
  uniqLngLat: uniqueIndex('uniq_lng_lat').on(t.lat, t.lng),
  indexProviderPlaceId: uniqueIndex('index_provider_place_id').on(t.provider, t.providerPlaceId)
}))

export const RefreshToken = pgTable('refresh_tokens', {
  token: varchar('token').primaryKey(),
  userId: integer('user_id').references(() => User.id, { onDelete: 'cascade' }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  expiredAt: timestamp('expired_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const authRelations = relations(RefreshToken, ({ one }) => ({
  user: one(User, { fields: [RefreshToken.userId], references: [User.id] }),
}))

export const userRelations = relations(User, ({ one, many }) => ({
  trips: many(Trip),
  itineraries: many(Itinerary),
  account: one(Account, { fields: [User.id], references: [Account.userId] }),
}))

export const tripRelations = relations(Trip, ({ one }) => ({
  itinerary: one(Itinerary, { fields: [Trip.itineraryId], references: [Itinerary.id] }),
  user: one(User, { fields: [Trip.userId], references: [User.id] }),
}))
export const itineraryRelations = relations(Itinerary, ({ one, many }) => ({
  stops: many(ItineraryStop),
  trip: one(Trip),
}))

export const itineraryStopRelations = relations(ItineraryStop, ({ one, many }) => ({
  itinerary: one(Itinerary, { fields: [ItineraryStop.itineraryId], references: [Itinerary.id] }),
}))

export const InsertUserSchema = createInsertSchema(User, {
  email: (schema) => schema.email.email(),
  name: (schema) => schema.name.trim(),
});
export const SelectUserSchema = createSelectSchema(User);

export const SelectTripSchema = createSelectSchema(Trip);
export const InsertTripSchema = createInsertSchema(Trip);
export const UpdateTripSchema = InsertTripSchema
  .omit({ userId: true, itineraryId: true, createdAt: true })
  .extend({ id: z.number() })

export const SelectItinerarySchema = createSelectSchema(Itinerary);
export const InsertItinerarySchema = createInsertSchema(Itinerary)
  .omit({ createdAt: true })
  .merge(z.object({
    ownerId: z.number(),
  }));
export const UpdateItinerarySchema = InsertItinerarySchema
  .omit({ ownerId: true, createdAt: true, isPublic: true })
  .merge(z.object({
    id: z.number()
  }))

export const SelectItineraryStopSchema = createSelectSchema(ItineraryStop);
export const InsertItineraryStopSchema = createInsertSchema(ItineraryStop);

export const SelectPlaceSchema = createSelectSchema(Place);
export const InsertPlaceSchema = createInsertSchema(Place)