import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { RedisDatabaseClient } from '@tmlmobilidade/go-clients-redis';
import { createHash } from 'node:crypto';

const WINDOW_SECONDS = 15 * 60;
const INCREMENT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return count
`;

/** Shared counters enforce the same limits across API replicas, without storing identities. */
export function authRateLimit(action: 'login' | 'recovery' | 'reset') {
	return async (request: FastifyRequest, reply: FastifyReply<void>) => {
		const body = request.body as undefined | { email?: unknown, token?: unknown };
		const identity = action === 'reset' ? body?.token : body?.email;
		const account = typeof identity === 'string' ? identity.trim().toLowerCase() : '';
		const window = Math.floor(Date.now() / (WINDOW_SECONDS * 1000));
		const limits = action === 'login' ? [100, 10] : action === 'recovery' ? [20, 3] : [30, 5];
		try {
			const client = await RedisDatabaseClient.getClient({ prefix: 'CACHEDB' });
			const subjects = [request.ip, account];
			for (const [index, subject] of subjects.entries()) {
				const digest = createHash('sha256').update(subject).digest('hex');
				const count = Number(await client.eval(INCREMENT, {
					arguments: [String(WINDOW_SECONDS)],
					keys: [`core:auth:rate:${action}:${index}:${digest}:${window}`],
				}));
				if (count > limits[index]) {
					const retryAfter = WINDOW_SECONDS - Math.floor(Date.now() / 1000) % WINDOW_SECONDS;
					reply.header('Retry-After', String(retryAfter));
					return sendErrorApiResponse(reply, { error: 'Too many attempts. Please try again later.', status_code: '429' });
				}
			}
		} catch {
			// Fail closed when the shared abuse protection is unavailable.
			return sendErrorApiResponse(reply, { error: 'Authentication temporarily unavailable', status_code: '503' });
		}
	};
}
