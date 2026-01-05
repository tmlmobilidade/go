import { GtfsCause, GtfsEffect } from '@tmlmobilidade/types';

export function getAlertTitleAndDescription(
	cause: GtfsCause,
	effect: GtfsEffect,
	lines: string,
	detour?: string,
	municipalities?: string,
	direction?: string,
	street?: string,
	stop?: string,
) {
	return {
		descriptionKey: `causesAndEffects.${cause}.${effect}.message`,
		params: {
			detour: detour ?? '',
			direction: direction ?? '',
			lines,
			municipalities: municipalities ?? '',
			stop: stop ?? '',
			street: street ?? '',
		},
		titleKey: `causesAndEffects.${cause}.${effect}.title`,
	};
}
