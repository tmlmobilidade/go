/* * */

import { GtfsRtCauseSchema } from '@/alert/alert-cause.js';
import { GtfsRtEffectSchema } from '@/alert/alert-effect.js';
import { GtfsRtEntitySelectorSchema } from '@/alert/entity-selector.js';
import { GtfsRtSeverityLevelSchema } from '@/alert/severity-level.js';
import { GtfsRtTimeRangeSchema } from '@/alert/time-range.js';
import { GtfsRtTranslatedImageSchema } from '@/alert/translated-image.js';
import { GtfsRtTranslatedStringSchema } from '@/alert/translated-string.js';
import { z } from 'zod';

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
