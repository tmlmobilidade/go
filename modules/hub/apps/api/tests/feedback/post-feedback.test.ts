import { createStoredFeedback, type PostFeedbackDependencies, isFeedbackEntityValid, postFeedback } from '@/endpoints/v1/feedback/controllers/post-feedback';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type PublicFeedback } from '@tmlmobilidade/go-types-public-info';
import { PublicFeedbackSubmissionSchema } from '@tmlmobilidade/go-types-public-info';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/* * */

const lineSubmission = PublicFeedbackSubmissionSchema.parse({
	agency_id: 'agency-1',
	entity_id: 'line-1',
	entity_type: 'line',
	mood: 'unhappy',
	reasons: ['late'],
	schema_version: 'v1',
});

const stopSubmission = PublicFeedbackSubmissionSchema.parse({
	entity_id: '100001',
	entity_type: 'stop',
	mood: 'happy',
	reasons: ['no_bench'],
	schema_version: 'v1',
});

/* * */

describe('post feedback', () => {
	it('validates and inserts a submission through the POST handler', async () => {
		const insertedFeedback: PublicFeedback[] = [];
		const dependencies: PostFeedbackDependencies = {
			getCacheValue: async () => JSON.stringify([createHubLine('line-1', 'agency-1')]),
			incrementRateLimit: async () => 1,
			insertFeedback: async feedback => void insertedFeedback.push(feedback),
			now: () => 1_700_000_000_000,
		};
		const response = createTestReply();

		await postFeedback({
			body: lineSubmission,
			headers: { 'content-type': 'application/json' },
			ip: '127.0.0.1',
		} as Parameters<typeof postFeedback>[0], response.reply, dependencies);

		assert.equal(response.statusCode, HTTP_STATUS.CREATED);
		assert.deepEqual(response.payload, {
			data: null,
			error: null,
			statusCode: HTTP_STATUS.CREATED,
		});
		assert.deepEqual(insertedFeedback, [{
			...lineSubmission,
			created_at: 1_700_000_000_000,
		}]);
	});

	it('inserts stop feedback without agency attribution', async () => {
		const insertedFeedback: PublicFeedback[] = [];
		const dependencies: PostFeedbackDependencies = {
			getCacheValue: async () => JSON.stringify([createHubStop(100_001)]),
			incrementRateLimit: async () => 1,
			insertFeedback: async feedback => void insertedFeedback.push(feedback),
			now: () => 1_700_000_000_000,
		};
		const response = createTestReply();

		await postFeedback({
			body: stopSubmission,
			headers: { 'content-type': 'application/json; charset=utf-8' },
			ip: '127.0.0.1',
		} as Parameters<typeof postFeedback>[0], response.reply, dependencies);

		assert.deepEqual(insertedFeedback, [{
			agency_id: null,
			created_at: 1_700_000_000_000,
			entity_id: '100001',
			entity_type: 'stop',
			mood: 'happy',
			reasons: ['no_bench'],
			schema_version: 'v1',
		}]);
	});

	it('rejects an invalid entity before inserting feedback', async () => {
		let insertCount = 0;
		const dependencies: PostFeedbackDependencies = {
			getCacheValue: async () => JSON.stringify([createHubLine('line-2', 'agency-1')]),
			incrementRateLimit: async () => 1,
			insertFeedback: async () => void insertCount++,
			now: () => 1_700_000_000_000,
		};
		const response = createTestReply();

		await assert.rejects(
			postFeedback({
				body: lineSubmission,
				headers: { 'content-type': 'application/json' },
				ip: '127.0.0.1',
			} as Parameters<typeof postFeedback>[0], response.reply, dependencies),
			(error: unknown) => error instanceof HttpException && error.statusCode === HTTP_STATUS.BAD_REQUEST,
		);
		assert.equal(insertCount, 0);
	});

	it('rejects non-JSON submissions before accessing infrastructure', async () => {
		let infrastructureCallCount = 0;
		const dependencies: PostFeedbackDependencies = {
			getCacheValue: async () => null,
			incrementRateLimit: async () => ++infrastructureCallCount,
			insertFeedback: async () => void infrastructureCallCount++,
			now: Date.now,
		};
		const response = createTestReply();

		await assert.rejects(
			postFeedback({
				body: lineSubmission,
				headers: { 'content-type': 'text/plain' },
				ip: '127.0.0.1',
			} as Parameters<typeof postFeedback>[0], response.reply, dependencies),
			(error: unknown) => error instanceof HttpException && error.statusCode === HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE,
		);
		assert.equal(infrastructureCallCount, 0);
	});

	it('returns a retry window when the client exceeds the rate limit', async () => {
		const dependencies: PostFeedbackDependencies = {
			getCacheValue: async () => null,
			incrementRateLimit: async () => 11,
			insertFeedback: async () => undefined,
			now: Date.now,
		};
		const response = createTestReply();

		await assert.rejects(
			postFeedback({
				body: lineSubmission,
				headers: { 'content-type': 'application/json' },
				ip: '127.0.0.1',
			} as Parameters<typeof postFeedback>[0], response.reply, dependencies),
			(error: unknown) => error instanceof HttpException && error.statusCode === HTTP_STATUS.TOO_MANY_REQUESTS,
		);
		assert.equal(response.headers.get('retry-after'), 600);
	});

	it('reports temporary unavailability when ClickHouse rejects the insert', async () => {
		const dependencies: PostFeedbackDependencies = {
			getCacheValue: async () => JSON.stringify([createHubLine('line-1', 'agency-1')]),
			incrementRateLimit: async () => 1,
			insertFeedback: async () => {
				throw new Error('ClickHouse unavailable');
			},
			now: () => 1_700_000_000_000,
		};
		const response = createTestReply();

		await assert.rejects(
			postFeedback({
				body: lineSubmission,
				headers: { 'content-type': 'application/json' },
				ip: '127.0.0.1',
			} as Parameters<typeof postFeedback>[0], response.reply, dependencies),
			(error: unknown) => error instanceof HttpException && error.statusCode === HTTP_STATUS.SERVICE_UNAVAILABLE,
		);
	});

	it('validates line IDs together with their agency attribution', () => {
		assert.equal(isFeedbackEntityValid(lineSubmission, {
			lines: [{ _id: 'line-1', agency_id: 'agency-1' }],
		}), true);
		assert.equal(isFeedbackEntityValid(lineSubmission, {
			lines: [{ _id: 'line-1', agency_id: 'agency-2' }],
		}), false);
		assert.equal(isFeedbackEntityValid(lineSubmission, {
			lines: [{ _id: 'line-2', agency_id: 'agency-1' }],
		}), false);
	});

	it('validates stops without agency attribution', () => {
		assert.equal(isFeedbackEntityValid(stopSubmission, { stops: [{ _id: 100_001 }] }), true);
		assert.equal(isFeedbackEntityValid(stopSubmission, { stops: [{ _id: 100_002 }] }), false);
	});

	it('stores a null agency for stop feedback', () => {
		assert.deepEqual(createStoredFeedback(stopSubmission, 1_700_000_000_000), {
			agency_id: null,
			created_at: 1_700_000_000_000,
			entity_id: '100001',
			entity_type: 'stop',
			mood: 'happy',
			reasons: ['no_bench'],
			schema_version: 'v1',
		});
	});
});

/* * */

function createHubLine(id: string, agencyId: string) {
	return {
		_id: id,
		agency_id: agencyId,
		color: '#000000',
		long_name: 'Line',
		short_name: '1',
		text_color: '#FFFFFF',
		tts_name: 'Line',
	};
}

/* * */

function createHubStop(id: number) {
	return {
		_id: id,
		agency_ids: [],
		district_id: 'district',
		district_name: 'District',
		flags: [],
		latitude: 38.7,
		legacy_ids: [],
		lifecycle_status: 'active',
		line_ids: [],
		locality_id: null,
		locality_name: null,
		longitude: -9.1,
		municipality_id: 'municipality',
		municipality_name: 'Municipality',
		name: 'Stop',
		parish_id: 'parish',
		parish_name: 'Parish',
		pattern_ids: [],
		route_ids: [],
		short_name: 'Stop',
		tts_name: 'Stop',
	};
}

/* * */

function createTestReply() {
	let payload: unknown;
	let statusCode: number | undefined;
	const headers = new Map<string, number | string>();
	const reply = {
		code(code: number) {
			statusCode = code;
			return reply;
		},
		header(name: string, value: number | string) {
			headers.set(name, value);
			return reply;
		},
		send(responsePayload: unknown) {
			payload = responsePayload;
			return responsePayload;
		},
	};

	return {
		headers,
		get payload() {
			return payload;
		},
		reply: reply as unknown as Parameters<typeof postFeedback>[1],
		get statusCode() {
			return statusCode;
		},
	};
}
