/* * */

import { z } from 'zod';

/* * */

export const TimeSlotValues = [
	'1s',
	'5s',
	'10s',
	'30s',
	'1m',
	'5m',
	'10m',
	'15m',
	'30m',
	'1h',
	'2h',
	'3h',
	'6h',
	'12h',
	'24h',
] as const;

export const TimeSlotSchema = z.enum(TimeSlotValues);

export type TimeSlot = z.infer<typeof TimeSlotSchema>;

/* * */

export const TimeSlotMap: Record<TimeSlot, number> = {
	'10m': 600_000,
	'10s': 10_000,
	'12h': 43_200_000,
	'15m': 900_000,
	'1h': 3_600_000,
	'1m': 60_000,
	'1s': 1_000,
	'24h': 86_400_000,
	'2h': 7_200_000,
	'30m': 1_800_000,
	'30s': 30_000,
	'3h': 10_800_000,
	'5m': 300_000,
	'5s': 5_000,
	'6h': 21_600_000,
};
