/* * */

import { z } from 'zod';

import { GtfsRtCauseSchema } from './alert-cause.js';
import { GtfsRtEffectSchema } from './alert-effect.js';
import { GtfsRtEntitySelectorSchema } from './entity-selector.js';
import { GtfsRtSeverityLevelSchema } from './severity-level.js';
import { GtfsRtTimeRangeSchema } from './time-range.js';
import { GtfsRtTranslatedImageSchema } from './translated-image.js';
import { GtfsRtTranslatedStringSchema } from './translated-string.js';

/* * */

export const GtfsRtAlertSchema = z.object({
	active_period: z.array(GtfsRtTimeRangeSchema).nullish(),
	cause: GtfsRtCauseSchema.nullish(),
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
