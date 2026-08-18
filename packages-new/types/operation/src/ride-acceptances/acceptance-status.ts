/* * */

import { z } from 'zod';

/* * */

export const RideAcceptanceStatusValues = [
	'justification_required',
	'under_review',
	'accepted',
	'rejected',
] as const;

export const RideAcceptanceStatusSchema = z.enum(RideAcceptanceStatusValues);

export type RideAcceptanceStatus = z.infer<typeof RideAcceptanceStatusSchema>;
