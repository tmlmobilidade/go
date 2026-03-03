/* * */

import { z } from 'zod';

/* * */

/**
 * Afetacao row for GTFS v29
 * Note: afetacao is not in standard GTFS types package
 */

export const GtfsTMLAfetacaoSchema = z.object({
	accepted_zone_codes: z.string(),
	interchange: z.number(),
	line_id: z.string(),
	pattern_id: z.string(),
	stop_id: z.string(),
});

export type GtfsTMLAfetacao = z.infer<typeof GtfsTMLAfetacaoSchema>;
