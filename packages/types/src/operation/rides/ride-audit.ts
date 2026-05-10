/* * */

import { NoteCommentSchema } from '@/_common/comment.js';
import { DocumentSchema } from '@/_common/document.js';
import { z } from 'zod';

/* * */

export const RideAuditSchema = DocumentSchema.extend({
	comments: z.array(NoteCommentSchema),
	is_locked: z.boolean().default(false),
	ride_id: z.string(),
});

export const CreateRideAuditSchema = RideAuditSchema.partial({ _id: true }).omit({ created_at: true, updated_at: true });
export const UpdateRideAuditSchema = CreateRideAuditSchema.omit({ created_by: true }).partial();

/* * */

export type RideAudit = z.infer<typeof RideAuditSchema>;
export type CreateRideAuditDto = z.infer<typeof CreateRideAuditSchema>;
export type UpdateRideAuditDto = z.infer<typeof UpdateRideAuditSchema>;
