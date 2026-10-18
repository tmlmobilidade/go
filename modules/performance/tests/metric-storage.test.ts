import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type MetricDocument, type RealtimeDemand } from '@tmlmobilidade/go-types-performance';

import { PerformanceDatabase } from '../../../packages-new/interfaces/godb/src/databases/performance.js';

function createStorage() {
	const documents = new Map<string, MetricDocument>();
	const collection = {
		deleteMany: async (filter: { metric: string }) => {
			let deletedCount = 0;
			for (const [id, doc] of documents) {
				if (doc.metric !== filter.metric) continue;
				documents.delete(id);
				deletedCount++;
			}
			return { acknowledged: true, deletedCount };
		},
		distinct: async () => [...documents.keys()],
		find: (filter: { _id?: { $in: string[] }, metric?: string } = {}) => ({
			toArray: async () => [...documents.values()].filter(doc => (!filter.metric || doc.metric === filter.metric) && (!filter._id || filter._id.$in.includes(doc._id))),
		}),
		findOne: async (filter: { _id: string }) => documents.get(filter._id) ?? null,
		insertMany: async (docs: MetricDocument[]) => {
			for (const doc of docs) documents.set(doc._id, doc);
			return { acknowledged: true, insertedIds: Object.fromEntries(docs.map((doc, index) => [index, doc._id])) };
		},
		insertOne: async (doc: MetricDocument) => {
			documents.set(doc._id, doc);
			return { acknowledged: true, insertedId: doc._id };
		},
	};
	const client = {
		db: (name: string) => {
			assert.equal(name, 'performance');
			return { collection: (name: string) => { assert.equal(name, 'metrics'); return collection; } };
		},
	} as unknown as MongoClient;
	return { documents, metrics: new PerformanceDatabase(client).metrics };
}

const realtime: RealtimeDemand = {
	data: { agencies: { 41: { last_week: 2, now: 3 } }, total: { last_week: 2, now: 3 } },
	generated_at: new Date('2026-10-17T12:00:00Z'),
	metric: 'realtime_demand',
};

test('single and bulk metric writes retain their payload, IDs and timestamps in performance.metrics', async () => {
	const { metrics } = createStorage();
	const single = await metrics.insertOne(realtime);
	const [bulk] = await metrics.insertMany([{
		data: { '2026-10-17': { qty: 12 } },
		generated_at: realtime.generated_at,
		metric: 'demand_by_agency_by_month',
		properties: { agency_id: '41' },
	}]);
	assert.deepEqual(single.data, realtime.data);
	assert.deepEqual(single.generated_at, realtime.generated_at);
	assert.ok(single._id);
	assert.ok(bulk._id);
	assert.notEqual(single._id, bulk._id);
	assert.equal(typeof single.created_at, 'number');
	assert.equal(typeof bulk.updated_at, 'number');
	assert.deepEqual(await metrics.findMany({ metric: 'realtime_demand' }), [single]);
	await metrics.deleteMany({ metric: 'realtime_demand' });
	assert.deepEqual(await metrics.findMany(), [bulk]);
});

test('invalid generated results fail validation before a MongoDB write', async () => {
	const { documents, metrics } = createStorage();
	const invalid = { ...realtime, data: { agencies: {}, total: { last_week: 0, now: 'invalid' } } } as unknown as RealtimeDemand;
	await assert.rejects(metrics.insertOne(invalid));
	await assert.rejects(metrics.insertMany([realtime, invalid]));
	assert.equal(documents.size, 0);
});
