import { GtfsCause, GtfsEffect } from '@tmlmobilidade/types';

export function getAlertTitleAndDescription(cause: GtfsCause, effect: GtfsEffect, lines: string, detour?: string) {
	return {
		descriptionKey: `causesAndEffects.${cause}.${effect}.message`,
		params: { detour: detour ?? '', lines },
		titleKey: `causesAndEffects.${cause}.${effect}.title`,
	};
}
