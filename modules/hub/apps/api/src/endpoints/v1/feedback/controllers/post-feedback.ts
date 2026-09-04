/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { cacheDb, type CacheDbKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type HubLine, HubLineSchema, type HubStop, HubStopSchema, type PublicFeedback, PublicFeedbackSchema, type PublicFeedbackSubmission, PublicFeedbackSubmissionSchema } from '@tmlmobilidade/go-types-hub';
import { createHash } from 'node:crypto';

/* * */

const FEEDBACK_BODY_LIMIT_BYTES = 4_096;
const FEEDBACK_RATE_LIMIT_MAX_REQUESTS = 10;
const FEEDBACK_RATE_LIMIT_WINDOW_SECONDS = 10 * 60;

interface FeedbackNetwork {
	lines?: Pick<HubLine, '_id' | 'agency_id'>[]
	stops?: Pick<HubStop, '_id'>[]
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
export async function postFeedback(request: FastifyRequest, reply: FastifyReply<null>, dependencies = postFeedbackDependencies) {
	if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
		throw new HttpException(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE, 'Content-Type must be application/json.');
	}

	await enforceFeedbackRateLimit(request.ip, reply, dependencies);

	const parsedSubmission = PublicFeedbackSubmissionSchema.safeParse(request.body);
	if (!parsedSubmission.success) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid feedback submission.');
	}

	const network = await loadFeedbackNetwork(parsedSubmission.data.entity_type, dependencies);
	if (!isFeedbackEntityValid(parsedSubmission.data, network)) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid feedback entity.');
	}

	const feedback = createStoredFeedback(parsedSubmission.data, dependencies.now());

	try {
		await dependencies.insertFeedback(feedback);
	} catch (error) {
		throw new HttpException(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Feedback is temporarily unavailable.', error);
	}

	return reply.code(HTTP_STATUS.CREATED).send({
		data: null,
		error: null,
		statusCode: HTTP_STATUS.CREATED,
	});
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

async function enforceFeedbackRateLimit(ipAddress: string, reply: FastifyReply<null>, dependencies: PostFeedbackDependencies) {
	const clientHash = createHash('sha256').update(ipAddress).digest('hex');
	const requestCount = await dependencies.incrementRateLimit(
		`hub:v1:feedback:rate-limit:${clientHash}`,
		FEEDBACK_RATE_LIMIT_WINDOW_SECONDS,
	);

	if (requestCount <= FEEDBACK_RATE_LIMIT_MAX_REQUESTS) return;

	reply.header('retry-after', FEEDBACK_RATE_LIMIT_WINDOW_SECONDS);
	throw new HttpException(HTTP_STATUS.TOO_MANY_REQUESTS, 'Too many feedback submissions.');
}

async function loadFeedbackNetwork(entityType: PublicFeedbackSubmission['entity_type'], dependencies: PostFeedbackDependencies): Promise<FeedbackNetwork> {
	const cacheKey = entityType === 'line' ? 'hub:v1:network:lines' : 'hub:v1:network:stops';
	const rawNetwork = await dependencies.getCacheValue(cacheKey);

	if (!rawNetwork) {
		throw new HttpException(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Feedback is temporarily unavailable.');
	}

	try {
		const networkData: unknown = JSON.parse(rawNetwork);

		if (entityType === 'line') {
			return { lines: HubLineSchema.array().parse(networkData) };
		}

		return { stops: HubStopSchema.array().parse(networkData) };
	} catch (error) {
		throw new HttpException(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Feedback is temporarily unavailable.', error);
	}
}
