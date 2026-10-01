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

/* * */

export const RideAcceptanceStatusFilterValues = [...RideAcceptanceStatusValues, 'none'] as const;

export const RideAcceptanceStatusFilterSchema = z.enum(RideAcceptanceStatusFilterValues);

export type RideAcceptanceStatusFilter = z.infer<typeof RideAcceptanceStatusFilterSchema>;
