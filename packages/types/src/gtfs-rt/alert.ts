/* * */

import { GtfsRtCauseSchema } from '@/gtfs-rt/cause.js';
import { GtfsRtEffectSchema } from '@/gtfs-rt/effect.js';
import { GtfsRtEntitySelectorSchema } from '@/gtfs-rt/entity-selector.js';
import { GtfsRtSeverityLevelSchema } from '@/gtfs-rt/severity-level.js';
import { GtfsRtTimeRangeSchema } from '@/gtfs-rt/time-range.js';
import { GtfsRtTranslatedImageSchema } from '@/gtfs-rt/translated-image.js';
import { GtfsRtTranslatedStringSchema } from '@/gtfs-rt/translated-string.js';
import { z } from 'zod';

/* * */

export const GtfsRtAlertSchema = z.object({
	active_period: z.array(GtfsRtTimeRangeSchema).nullish(),
	cause: GtfsRtCauseSchema.nullish(),
	coordinates: z.tuple([z.number(), z.number()]).nullable().default(null),
	description_text: GtfsRtTranslatedStringSchema,
	effect: GtfsRtEffectSchema.nullish(),
	header_text: GtfsRtTranslatedStringSchema,
	image: GtfsRtTranslatedImageSchema.nullish(),
	image_alternative_text: z.any().nullish(),
	informed_entity: z.array(GtfsRtEntitySelectorSchema).min(1),
	severity_level: GtfsRtSeverityLevelSchema.nullish(),
	tts_description_text: GtfsRtTranslatedStringSchema.nullish(),
	tts_header_text: GtfsRtTranslatedStringSchema.nullish(),
	url: GtfsRtTranslatedStringSchema.nullish(),
});

export type GtfsRtAlert = z.infer<typeof GtfsRtAlertSchema>;
