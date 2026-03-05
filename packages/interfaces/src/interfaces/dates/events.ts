/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateEventDto, CreateEventSchema, type Event, type UpdateEventDto, UpdateEventSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class EventsClass extends MongoCollectionClass<Event, CreateEventDto, UpdateEventDto> {
	private static _instance: EventsClass;
	protected override createSchema: z.ZodSchema = CreateEventSchema;
	protected override updateSchema: z.ZodSchema = UpdateEventSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!EventsClass._instance) {
			const instance = new EventsClass();
			await instance.connect();
			EventsClass._instance = instance;
		}
		return EventsClass._instance;
	}

	/**
	 * Finds Event documents by agency IDs.
	 *
	 * @param ids - The agency IDs to search for
	 * @returns A promise that resolves to an array of matching documents
	 */
	async findByAgencyIds(ids: string[]) {
		return this.mongoCollection.find({ agency_ids: { $in: ids } } as Filter<Event>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'events';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const events = asyncSingletonProxy(EventsClass);
