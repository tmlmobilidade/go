/* * */

import { authorizePatternAccess } from '@/utils/pattern-access.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PatternsCommentRequest, PatternsCommentRequestSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { type Pattern } from '@tmlmobilidade/go-types-offer';
import { NoteCommentSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { generateRandomString } from '@tmlmobilidade/strings';

/* * */

/** Adds a note with server-owned identity, author and timestamps. */
export async function commentPatternHandler(request: FastifyRequest<{ Body: PatternsCommentRequest, Params: { id: string } }>, reply: FastifyReply<Pattern>) {
	//
	// Validate the note's client-owned fields.

	const validatedComment = PatternsCommentRequestSchema.safeParse(request.body);
	if (!validatedComment.success) {
		return sendErrorApiResponse(reply, { error: validatedComment.error.message, status_code: '400' });
	}

	const pattern = await goDb.offer.patterns.findById(request.params.id);
	if (!pattern) {
		return sendErrorApiResponse(reply, { error: 'Pattern not found', status_code: '404' });
	}
	const access = await authorizePatternAccess({ action: 'update', pattern, permissions: request.permissions });
	if (access.success === false) {
		return sendErrorApiResponse(reply, { error: access.error, status_code: access.status_code });
	}

	//
	// Preserve display-name history authors; the document audit uses the actor ID.

	const author = `${request.me.first_name} ${request.me.last_name}`;
	const now = Dates.now('utc').unix_milliseconds;
	const comment = NoteCommentSchema.parse({
		...validatedComment.data,
		_id: generateRandomString({ length: 5 }),
		created_at: now,
		created_by: author,
		type: 'note',
		updated_at: now,
		updated_by: author,
	});
	const updatedPattern = await goDb.offer.patterns.updateOne({ _id: pattern._id }, {
		comments: [...(pattern.comments ?? []), comment],
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, updatedPattern);
}
