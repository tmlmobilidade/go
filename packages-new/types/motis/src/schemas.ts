/* * */

import { z } from 'zod';

import { LocationTypeSchema, ModeSchema } from './generated/schemas.gen.js';
import { type MotisGeocodeResponse, type MotisPlanLeg, type MotisPlanPlace, type MotisPlanResponse } from './models.js';

/* * */

export const MotisLocationTypeSchema = z.enum(LocationTypeSchema.enum);

export const MotisModeSchema = z.enum(ModeSchema.enum);

const MotisGeocodeAreaSchema = z.object({
	adminLevel: z.number().int(),
	default: z.boolean().optional(),
	matched: z.boolean(),
	name: z.string(),
	unique: z.boolean().optional(),
}).passthrough();

const MotisGeocodeResultSchema = z.object({
	areas: z.array(MotisGeocodeAreaSchema),
	category: z.string().optional(),
	country: z.string().optional(),
	houseNumber: z.string().optional(),
	id: z.string(),
	importance: z.number().optional(),
	lat: z.number(),
	level: z.number().optional(),
	lon: z.number(),
	modes: z.array(MotisModeSchema).optional(),
	name: z.string(),
	score: z.number(),
	street: z.string().optional(),
	tokens: z.array(z.tuple([z.number().int(), z.number().int()])),
	type: MotisLocationTypeSchema,
	tz: z.string().optional(),
	zip: z.string().optional(),
}).passthrough();

const MotisPlanPlaceSchema: z.ZodType<MotisPlanPlace> = z.object({
	arrival: z.string().optional(),
	departure: z.string().optional(),
	importance: z.number().optional(),
	lat: z.number(),
	level: z.number().optional(),
	lon: z.number(),
	name: z.string(),
	parentId: z.string().optional(),
	scheduledArrival: z.string().optional(),
	scheduledDeparture: z.string().optional(),
	stopId: z.string().optional(),
	tz: z.string().optional(),
}).passthrough();

const MotisPlanLegSchema: z.ZodType<MotisPlanLeg> = z.object({
	agencyId: z.string().optional(),
	directionId: z.string().optional(),
	distance: z.number().optional(),
	duration: z.number().int().nonnegative(),
	endTime: z.string().datetime({ offset: true }),
	from: MotisPlanPlaceSchema,
	headsign: z.string().optional(),
	intermediateStops: z.array(MotisPlanPlaceSchema).optional(),
	legGeometry: z.object({
		length: z.number().int().nonnegative(),
		points: z.string(),
		precision: z.number().int().nonnegative(),
	}),
	mode: MotisModeSchema,
	realTime: z.boolean(),
	routeId: z.string().optional(),
	routeShortName: z.string().optional(),
	scheduled: z.boolean(),
	scheduledEndTime: z.string().datetime({ offset: true }),
	scheduledStartTime: z.string().datetime({ offset: true }),
	startTime: z.string().datetime({ offset: true }),
	to: MotisPlanPlaceSchema,
	tripId: z.string().optional(),
}).passthrough();

const MotisItinerarySchema = z.object({
	duration: z.number().int().nonnegative(),
	endTime: z.string().datetime({ offset: true }),
	id: z.string(),
	legs: z.array(MotisPlanLegSchema),
	startTime: z.string().datetime({ offset: true }),
	transfers: z.number().int().nonnegative(),
}).passthrough();

/* * */

export const MotisGeocodeResponseSchema: z.ZodType<MotisGeocodeResponse> = z.array(MotisGeocodeResultSchema);

export const MotisPlanResponseSchema: z.ZodType<MotisPlanResponse> = z.object({
	debugOutput: z.record(z.number()),
	direct: z.array(MotisItinerarySchema),
	from: MotisPlanPlaceSchema,
	itineraries: z.array(MotisItinerarySchema),
	nextPageCursor: z.string(),
	previousPageCursor: z.string(),
	requestParameters: z.record(z.string()),
	to: MotisPlanPlaceSchema,
}).passthrough();
