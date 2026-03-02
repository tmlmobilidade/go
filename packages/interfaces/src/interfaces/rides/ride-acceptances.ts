/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { HttpException, HTTP_STATUS } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type CreateRideAcceptanceDto, CreateRideAcceptanceSchema, type RideAcceptance, type UpdateRideAcceptanceDto, UpdateRideAcceptanceSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy, compareObjects, flattenObject } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription, InsertOneOptions, UpdateOptions } from 'mongodb';
import { z } from 'zod';

/* * */

class RideAcceptanceClass extends MongoCollectionClass<RideAcceptance, CreateRideAcceptanceDto, UpdateRideAcceptanceDto> {
	private static _instance: RideAcceptanceClass;
	protected override createSchema: z.ZodSchema = CreateRideAcceptanceSchema;
	protected override updateSchema: z.ZodSchema = UpdateRideAcceptanceSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!RideAcceptanceClass._instance) {
			const instance = new RideAcceptanceClass();
			await instance.connect();
			RideAcceptanceClass._instance = instance;
		}
		return RideAcceptanceClass._instance;
	}

	public async createByRideId(ride_id: string, data: CreateRideAcceptanceDto, options: InsertOneOptions & { returnResult?: boolean } = {}): Promise<RideAcceptance> {
		const currentTimestamp = Dates.now('utc').unix_timestamp;
		const createdBy = data.created_by || 'system';

		data.comments.push({
			created_at: currentTimestamp,
			created_by: createdBy,
			message: 'Ride acceptance created',
			type: 'note',
			updated_at: currentTimestamp,
		});

		data.comments.push({
			created_at: currentTimestamp,
			created_by: createdBy,
			curr_value: data.analysis_summary,
			field: 'analysis_summary',
			prev_value: null,
			type: 'field_changed',
			updated_at: currentTimestamp,
		});

		return super.insertOne({ ...data, ride_id } as RideAcceptance, { options }) as Promise<RideAcceptance>;
	}

	public async findByRideId(ride_id: string): Promise<null | RideAcceptance> {
		return super.findOne({ ride_id } as Filter<RideAcceptance>) as Promise<null | RideAcceptance>;
	}

	public async updateByRideId(ride_id: string, data: UpdateRideAcceptanceDto, options: UpdateOptions & { returnResult?: boolean } = {}): Promise<RideAcceptance> {
		const prevAcceptance = await this.findByRideId(ride_id);

		if (!prevAcceptance) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride acceptance not found');
		}

		const diff = compareObjects<RideAcceptance>(prevAcceptance, data);
		const flattenedDiff = flattenObject(diff);

		data.comments = data.comments || prevAcceptance.comments || [];

		for (const key of Object.keys(flattenedDiff)) {
			if (key === 'is_locked' || key === 'acceptance_status' || key === 'justification' || key === 'analysis_summary') {
				data.comments.push({
					created_at: Dates.now('utc').unix_timestamp,
					created_by: data.updated_by || 'system',
					curr_value: data[key],
					field: key,
					prev_value: prevAcceptance[key],
					type: 'field_changed',
					updated_at: Dates.now('utc').unix_timestamp,
					updated_by: data.updated_by || 'system',
				});
			}
		}

		return super.updateOne({ ride_id } as Filter<RideAcceptance>, data, options) as Promise<RideAcceptance>;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { ride_id: 1 } },
			{ background: true, key: { acceptance_status: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'ride_acceptances';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const rideAcceptances: Omit<RideAcceptanceClass, 'deleteById' | 'deleteMany' | 'deleteOne' | 'insertOne' | 'updateById' | 'updateOne'> = asyncSingletonProxy(RideAcceptanceClass);
