/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateRideDto, CreateRideSchema, type Ride, type UpdateRideDto, UpdateRideSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class RidesClass extends MongoCollectionClass<Ride, CreateRideDto, UpdateRideDto> {
	private static _instance: RidesClass;
	protected override createSchema: z.ZodSchema = CreateRideSchema;
	protected override updateSchema: z.ZodSchema = UpdateRideSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!RidesClass._instance) {
			const instance = new RidesClass();
			await instance.connect();
			RidesClass._instance = instance;
		}
		return RidesClass._instance;
	}

	/**
	 * Finds ride documents by Agency ID.
	 *
	 * @param agencyId - The Agency ID to search for
	 * @returns A promise that resolves to an array of matching ride documents
	 */
	async findByAgencyId(agencyId: string) {
		return this.mongoCollection.find({ agency_id: agencyId } as Filter<Ride>).toArray();
	}

	/**
	 * Finds ride documents by Line ID.
	 *
	 * @param lineId - The Line ID to search for
	 * @returns A promise that resolves to an array of matching ride documents
	 */
	async findByLineId(lineId: number) {
		return this.mongoCollection.find({ line_id: lineId } as Filter<Ride>).toArray();
	}

	/**
	 * Finds ride documents by Pattern ID.
	 *
	 * @param patternId - The Pattern ID to search for
	 * @returns A promise that resolves to an array of matching ride documents
	 */
	async findByPatternId(patternId: string) {
		return this.mongoCollection.find({ pattern_id: patternId } as Filter<Ride>).toArray();
	}

	/**
	 * Finds ride documents by Plan ID.
	 *
	 * @param planId - The Plan ID to search for
	 * @returns A promise that resolves to an array of matching ride documents
	 */
	async findByPlanId(planId: string) {
		return this.mongoCollection.find({ plan_id: planId } as Filter<Ride>).toArray();
	}

	/**
	 * Finds ride documents by Route ID.
	 *
	 * @param routeId - The Route ID to search for
	 * @returns A promise that resolves to an array of matching ride documents
	 */
	async findByRouteId(routeId: string) {
		return this.mongoCollection.find({ route_id: routeId } as Filter<Ride>).toArray();
	}

	/**
	 * Finds ride documents by Trip ID.
	 *
	 * @param tripId - The Trip ID to search for
	 * @returns A promise that resolves to an array of matching ride documents
	 */
	async findByTripId(tripId: string) {
		return this.mongoCollection.find({ trip_id: tripId } as Filter<Ride>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		/**
		 * IMPORTANT:
		 * Automatic sorting (ESLint) of keys in the JS objects should be disabled.
		 * The order of keys in a compound index is very important and should be
		 * carefully considered based on the cardinality of each key.
		 */
		return [
			{ background: true, key: { hashed_trip_id: 1 } },
			{ background: true, key: { hashed_shape_id: 1 } },
			{ background: true, key: { operational_date: 1 } },
			{ background: true, key: { operational_date: 1, system_status: 1 } },
			{ background: true, key: { start_time_scheduled: 1 } },
			{ background: true, key: { system_status: 1 } },
			{ background: true, key: { agency_id: 1, start_time_scheduled: -1, hashed_trip_id: 1 } },
			{ background: true, key: { hashed_trip_id: 1, start_time_scheduled: -1 } },
			// eslint-disable-next-line perfectionist/sort-objects
			{ background: true, key: { system_status: 1, start_time_scheduled: 1 } },
			// eslint-disable-next-line perfectionist/sort-objects
			{ background: true, key: { trip_id: 1, start_time_scheduled: 1 } },
			{ background: true, key: { trip_id: 1 } },
			{ background: true, key: { plan_id: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'rides';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const rides = asyncSingletonProxy(RidesClass);
