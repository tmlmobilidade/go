/* * */

import { DocumentSchema, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { type ApprovalStatus, ApprovalStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

//
// Define constants for enum values for better maintainability

export const ScopeSchema = z.enum(['stop', 'lines']);
export type Scope = z.infer<typeof ScopeSchema>;

// Define schemas using constants

export const ProposedChangeSchema = DocumentSchema.extend({
	curr_value: z.any(),
	field: z.string(),
	related_id: z.string(),
	scope: ScopeSchema,
	status: ApprovalStatusSchema,
});

//
// Define the Proposed Change types

export type ProposedChange<T> = {
	[P in keyof T]: {
		_id: string
		created_at: UnixTimestamp
		created_by: string
		curr_value: T[P]
		field: P
		related_id: string
		scope: Scope
		status: ApprovalStatus
		updated_at: UnixTimestamp
		updated_by: string
	}
}[keyof T];

export const CreateProposedChangeSchema = ProposedChangeSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateProposedChangeSchema = CreateProposedChangeSchema.omit({ created_by: true }).partial();

export type CreateProposedChangeDto<T> = Omit<ProposedChange<T>, '_id' | 'created_at' | 'updated_at'>;
export type UpdateProposedChangeDto<T> = Omit<CreateProposedChangeDto<T>, 'created_by'>;
