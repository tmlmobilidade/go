/* * */

import { GtfsBinarySchema } from '@/gtfs-new/common.js';
import { GtfsStopSchema } from '@/gtfs-new/stops.js';
import { z } from 'zod';

/* * */

export const GtfsTMLStopSchema = GtfsStopSchema.extend({
	bench: z.string().nullish(),
	entrance_restriction: z.string().nullish(),
	equipment: z.string().nullish(),
	exit_restriction: z.string().nullish(),
	has_bench: GtfsBinarySchema.default(0),
	has_network_map: GtfsBinarySchema.default(0),
	has_pip_real_time: GtfsBinarySchema.default(0),
	has_schedules: GtfsBinarySchema.default(0),
	has_shelter: GtfsBinarySchema.default(0),
	has_stop_sign: GtfsBinarySchema.default(0),
	has_tariffs_information: GtfsBinarySchema.default(0),
	municipality: z.string().nullish(),
	municipality_id: z.string().nullish(),
	network_map: z.string().nullish(),
	observations: z.string().nullish(),
	parish_id: z.string().nullish(),
	preservation_state: z.string().nullish(),
	public_visible: GtfsBinarySchema.default(0),
	real_time_information: z.string().nullish(),
	region: z.string().nullish(),
	region_id: z.string().nullish(),
	schedule: z.string().nullish(),
	shelter: z.string().nullish(),
	shelter_code: z.string().nullish(),
	shelter_maintainer: z.string().nullish(),
	signalling: z.string().nullish(),
	slot: z.string().nullish(),
	stop_id_stepp: z.string().nullish(),
	stop_remarks: z.string().nullish(),
	stop_short_name: z.string().nullish(),
	tariff: z.string().nullish(),
	zone_shift: z.string().nullish(),
});

export type GtfsTMLStop = z.infer<typeof GtfsTMLStopSchema>;
