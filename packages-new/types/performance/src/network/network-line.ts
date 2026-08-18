/* * */

import { z } from 'zod';

/* * */

const NETWORK_LINE_ID_SEPARATOR = ':';

/* * */

export const PerformanceNetworkLineIdSchema = z.string().superRefine((value, context) => {
	const separatorIndex = value.indexOf(NETWORK_LINE_ID_SEPARATOR);
	if (
		separatorIndex <= 0
		|| separatorIndex === value.length - 1
		|| separatorIndex !== value.lastIndexOf(NETWORK_LINE_ID_SEPARATOR)
	) {
		context.addIssue({ code: 'custom', message: 'Network line ID must contain agency and line IDs' });
	}
});

/* * */

export function createPerformanceNetworkLineId(agencyId: string, lineId: string) {
	return PerformanceNetworkLineIdSchema.parse(`${agencyId}${NETWORK_LINE_ID_SEPARATOR}${lineId}`);
}

export function parsePerformanceNetworkLineId(value: string) {
	const parsed = PerformanceNetworkLineIdSchema.parse(decodeURIComponent(value));
	const separatorIndex = parsed.indexOf(NETWORK_LINE_ID_SEPARATOR);

	return {
		agency_id: parsed.slice(0, separatorIndex),
		line_id: parsed.slice(separatorIndex + 1),
	};
}

/* * */

export const PerformanceNetworkLineSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	code: z.string(),
	name: z.string(),
});

export const PerformanceNetworkPatternSchema = z.object({
	_id: z.string(),
	code: z.string(),
	destination: z.string(),
	headsign: z.string(),
	origin: z.string(),
});

export const PerformanceNetworkLineDetailSchema = PerformanceNetworkLineSchema.extend({
	agency_name: z.string(),
	agency_short_name: z.string(),
	pattern_count: z.number().int().nonnegative(),
	patterns: PerformanceNetworkPatternSchema.array(),
});

export type PerformanceNetworkLine = z.infer<typeof PerformanceNetworkLineSchema>;
export type PerformanceNetworkLineDetail = z.infer<typeof PerformanceNetworkLineDetailSchema>;
export type PerformanceNetworkPattern = z.infer<typeof PerformanceNetworkPatternSchema>;
