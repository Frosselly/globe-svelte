// schema/countries.ts
import { pgTable, varchar, real, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const countries = pgTable('countries', {
	iso2: varchar('iso2', { length: 2 }).primaryKey(),
	iso3: varchar('iso3', { length: 3 }).notNull(),
	ccn3: varchar('ccn3', { length: 3 }),
	cioc: varchar('cioc', { length: 3 }),
	name: varchar('name', { length: 100 }).notNull(),
	region: varchar('region', { length: 50 }),
	subregion: varchar('subregion', { length: 80 }),
	capital: varchar('capital', { length: 100 }),
	flagEmoji: varchar('flag_emoji', { length: 10 }),
	flagSvg: varchar('flag_svg', { length: 255 }),
	flagPng: varchar('flag_png', { length: 255 }),
	area: real('area'),
	population: integer('population'),
	latlng: jsonb('latlng').$type<number[]>(),
	borders: jsonb('borders').$type<string[]>(),
	timezones: jsonb('timezones').$type<string[]>(),
	continents: jsonb('continents').$type<string[]>(),
	currencies: jsonb('currencies').$type<Record<string, { name: string; symbol: string }>>(),
	languages: jsonb('languages').$type<Record<string, string>>(),
	updatedAt: timestamp('updated_at').defaultNow()
});
