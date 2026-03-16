/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { MetricSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

export type MetricDocument = z.infer<typeof MetricSchema>;

/* * */

class MetricsClass extends MongoCollectionClass<MetricDocument, MetricDocument, MetricDocument> {
	private static _instance: MetricsClass;
	protected override createSchema: z.ZodSchema = MetricSchema;
	protected override updateSchema: z.ZodSchema = MetricSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!MetricsClass._instance) {
			const instance = new MetricsClass();
			await instance.connect();
			MetricsClass._instance = instance;
		}
		return MetricsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { metric: 1 } },
			{ background: true, key: { 'properties.year': 1 } },
			{ background: true, key: { 'properties.month': 1 } },
			{ background: true, key: { 'data.lineId': 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'metrics';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const metrics = asyncSingletonProxy(MetricsClass);
