/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Change user password
 */
export async function changePasswordHandler(request: FastifyRequest<{ Body: { password_hash: string, token: string } }>, reply: FastifyReply<void>) {
	await goDb.withTransaction(async (session) => {
		const tokens = await goDb.core.verificationTokens.getCollection();
		const tokenResult = await tokens.findOneAndDelete({
			expires_at: { $gt: Dates.now('utc').unix_milliseconds },
			token: { $eq: request.body.token },
		}, { session });
		if (!tokenResult) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid or expired token');
		const user = await goDb.core.users.findById(tokenResult.user_id, { session });
		if (!user) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid or expired token');
		await goDb.core.users.updateById(user._id, {
			credential_version: (user.credential_version ?? 0) + 1,
			password_hash: request.body.password_hash,
		}, { session });
		await goDb.core.sessions.deleteMany({ user_id: { $eq: user._id } }, { session });
		await goDb.core.verificationTokens.deleteMany({ user_id: { $eq: user._id } }, { session });
	});
	// Send a success response
	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
