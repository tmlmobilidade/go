import { isSameIndex, prepareMongoIndexOptions } from '@tmlmobilidade/go-clients-mongo';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { type ProcessingStatus } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { after, mock, test } from 'node:test';

/* * */

const validation = {
	_id: 'test-validation',
	agency_id: 'test-agency',
	created_at: 1_800_000_000_000,
	created_by: 'test-user',
	file_id: 'test-file',
	gtfs_agency: { agency_id: 'test-agency', agency_name: 'Test Agency', agency_timezone: 'Europe/Lisbon' },
	gtfs_feed_info: { feed_end_date: 20270131, feed_lang: 'pt', feed_start_date: 20270101 },
	updated_at: 1_800_000_000_000,
	validation_attempts: 2,
	validity_status: 'invalid',
};

let savedValidation: typeof validation & { processing_status: ProcessingStatus, summary: unknown };

mock.module('@tmlmobilidade/go-clients-mongo', {
	namedExports: {
		MongoDatabaseClient: {
			getClient: async () => ({
				db: () => ({
					collection: () => ({
						findOne: async () => structuredClone(savedValidation),
						updateOne: async (_filter: unknown, update: { $set: Partial<GtfsValidation> }) => {
							Object.assign(savedValidation, update.$set);
							return { acknowledged: true };
						},
					}),
				}),
			}),
		},
		isSameIndex,
		prepareMongoIndexOptions,
	},
});

const { FastifyService } = await import('@tmlmobilidade/go-clients-fastify');
const { updateProcessingStatusHandler } = await import('../src/endpoints/gtfs-validations/handlers/update-processing-status.js');

const server = FastifyService.getInstance({ module: 'operation', origin: true }).server;
server.put('/gtfs-validations/:id/processing-status', {
	preHandler: async (request) => {
		request.permissions = [{ action: 'update_processing_status', resources: { agency_ids: [validation.agency_id] }, scope: 'gtfs_validations' }];
	},
}, updateProcessingStatusHandler);
after(async () => { await server.close(); });

const legacySummary = { messages: [], total_errors: 0, total_warnings: 0 };
const currentSummary = { results: [], totals: { errors: 0, infos: 0, warnings: 0 } };

const statusChanges = [
	{ expectedSummary: null, initialSummary: legacySummary, status: 'waiting' },
	{ expectedSummary: null, initialSummary: currentSummary, status: 'processing' },
	{ expectedSummary: currentSummary, initialSummary: currentSummary, status: 'error' },
] as const;

for (const { expectedSummary, initialSummary, status } of statusChanges) {
	test(`updates a GTFS validation to ${status} with the expected report`, async () => {
		savedValidation = { ...validation, processing_status: 'complete', summary: initialSummary };

		const response = await server.inject({
			method: 'PUT',
			payload: { processing_status: status },
			url: `/gtfs-validations/${validation._id}/processing-status`,
		});
		assert.equal(response.statusCode, 200, response.body);
		assert.equal(savedValidation.processing_status, status);
		assert.equal(savedValidation.validation_attempts, 0);
		assert.equal(savedValidation.validity_status, 'unknown');
		assert.deepEqual(savedValidation.summary, expectedSummary);
		assert.deepEqual(response.json().data.summary, expectedSummary);
	});
}
