/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { Alert, AlertSchema, CreateAlertDto, UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/types';
import { AsyncSingletonProxy } from '@tmlmobilidade/utils';
import { Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class AlertsRealtimeClass extends MongoCollectionClass<Alert, CreateAlertDto, UpdateAlertDto> {
	private static _instance: AlertsRealtimeClass;
	protected override createSchema: z.ZodSchema = AlertSchema;
	protected override updateSchema: z.ZodSchema = UpdateAlertSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!AlertsRealtimeClass._instance) {
			const instance = new AlertsRealtimeClass();
			await instance.connect();
			AlertsRealtimeClass._instance = instance;
		}
		return AlertsRealtimeClass._instance;
	}

	async findByMunicipalityId(municipality_id: string) {
		return this.mongoCollection.find({ municipality_ids: { $in: [municipality_id] } } as Filter<Alert>).toArray();
	}

	async findByTitle(title: string) {
		return this.mongoCollection.findOne({ title } as Filter<Alert>);
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { agency_ids: 1 } },
			{ background: true, key: { line_ids: 1 } },
			{ background: true, key: { municipality_ids: 1 } },
			{ background: true, key: { route_ids: 1 } },
			{ background: true, key: { stop_ids: 1 } },
			{ background: true, key: { title: 1 } },
			{ background: true, key: { active_period_end_date: -1, active_period_start_date: -1 } },
			{ background: true, key: { publish_end_date: -1, publish_start_date: -1 } },
		];
	}

	protected getCollectionName(): string {
		return 'alerts_realtime';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const alertsRealtime = AsyncSingletonProxy(AlertsRealtimeClass);
