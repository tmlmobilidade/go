/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb, type CacheDbKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { HubV1ApiLine, HubV1ApiLineSchema, HubV1ApiStop, HubV1ApiStopSchema, type PublicFeedback, PublicFeedbackSchema, type PublicFeedbackSubmission, PublicFeedbackSubmissionSchema } from '@tmlmobilidade/go-types-hub';
import { createHash } from 'node:crypto';

/* * */

const FEEDBACK_BODY_LIMIT_BYTES = 4_096;
const FEEDBACK_RATE_LIMIT_MAX_REQUESTS = 10;
const FEEDBACK_RATE_LIMIT_WINDOW_SECONDS = 10 * 60;

interface FeedbackNetwork {
	lines?: Pick<HubV1ApiLine, '_id' | 'agency_id'>[]
	stops?: Pick<HubV1ApiStop, '_id'>[]
}

interface FeedbackError {
	error: string
	status_code: '400' | '415' | '429' | '503'
}

export interface PostFeedbackDependencies {
	getCacheValue: (key: CacheDbKey) => Promise<null | string>
	incrementRateLimit: (key: CacheDbKey, ttl: number) => Promise<number>
	insertFeedback: (feedback: PublicFeedback) => Promise<unknown>
	now: () => number
}

const postFeedbackDependencies: PostFeedbackDependencies = {
	getCacheValue: key => cacheDb.get(key),
	incrementRateLimit: (key, ttl) => cacheDb.incrementWithExpiry(key, ttl),
	insertFeedback: feedback => labDb.hub.feedback.insert('JSONEachRow', [feedback]),
	now: Date.now,
};

/* * */

export const postFeedbackRouteOptions = {
	bodyLimit: FEEDBACK_BODY_LIMIT_BYTES,
};

/**
 * Validates and stores public feedback.
 * @param request Fastify request.
 * @param reply Fastify reply.
 */
export async function postFeedbackHandler(request: FastifyRequest, reply: FastifyReply<null>, dependencies = postFeedbackDependencies) {
	//

	//
	// Validate the content type and submission

	if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
		return sendErrorApiResponse(reply, { error: 'Content-Type must be application/json.', status_code: '415' });
	}

	const parsedSubmission = PublicFeedbackSubmissionSchema.safeParse(request.body);
	if (!parsedSubmission.success) {
		return sendErrorApiResponse(reply, { error: 'Invalid feedback submission.', status_code: '400' });
	}

	//
	// Limit submissions and validate the referenced network entity

	const rateLimitError = await enforceFeedbackRateLimit(request.ip, reply, dependencies);
	if (rateLimitError) return sendErrorApiResponse(reply, rateLimitError);

	const network = await loadFeedbackNetwork(parsedSubmission.data.entity_type, dependencies);
	if (!network) return sendErrorApiResponse(reply, { error: 'Feedback is temporarily unavailable.', status_code: '503' });
	if (!isFeedbackEntityValid(parsedSubmission.data, network)) {
		return sendErrorApiResponse(reply, { error: 'Invalid feedback entity.', status_code: '400' });
	}

	//
	// Store the feedback

	const feedback = createStoredFeedback(parsedSubmission.data, dependencies.now());

	try {
		await dependencies.insertFeedback(feedback);
	} catch {
		return sendErrorApiResponse(reply, { error: 'Feedback is temporarily unavailable.', status_code: '503' });
	}

	return sendSuccessApiResponse(reply, null, { status_code: '201' });
}

/* * */

export function createStoredFeedback(submission: PublicFeedbackSubmission, createdAt = Date.now()): PublicFeedback {
	return PublicFeedbackSchema.parse({
		...submission,
		agency_id: submission.entity_type === 'line' ? submission.agency_id : null,
		created_at: createdAt,
	});
}

export function isFeedbackEntityValid(submission: PublicFeedbackSubmission, network: FeedbackNetwork): boolean {
	if (submission.entity_type === 'line') {
		return network.lines?.some(line => line._id === submission.entity_id && line.agency_id === submission.agency_id) ?? false;
	}

	return network.stops?.some(stop => String(stop._id) === submission.entity_id) ?? false;
}

async function enforceFeedbackRateLimit(ipAddress: string, reply: FastifyReply<null>, dependencies: PostFeedbackDependencies): Promise<FeedbackError | null> {
	try {
		const clientHash = createHash('sha256').update(ipAddress).digest('hex');
		const requestCount = await dependencies.incrementRateLimit(
			`hub:v1:feedback:rate-limit:${clientHash}`,
			FEEDBACK_RATE_LIMIT_WINDOW_SECONDS,
		);

		if (requestCount <= FEEDBACK_RATE_LIMIT_MAX_REQUESTS) return null;

		reply.header('retry-after', FEEDBACK_RATE_LIMIT_WINDOW_SECONDS);
		return { error: 'Too many feedback submissions.', status_code: '429' };
	} catch {
		return { error: 'Feedback is temporarily unavailable.', status_code: '503' };
	}
}

async function loadFeedbackNetwork(entityType: PublicFeedbackSubmission['entity_type'], dependencies: PostFeedbackDependencies): Promise<FeedbackNetwork | null> {
	const cacheKey = entityType === 'line' ? 'hub:v1:network:lines' : 'hub:v1:network:stops';

	try {
		const rawNetwork = await dependencies.getCacheValue(cacheKey);
		if (!rawNetwork) return null;

		const networkData: unknown = JSON.parse(rawNetwork);
		return entityType === 'line'
			? { lines: HubV1ApiLineSchema.array().parse(networkData) }
			: { stops: HubV1ApiStopSchema.array().parse(networkData) };
	} catch {
		return null;
	}
}
