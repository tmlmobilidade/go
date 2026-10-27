import { type PatternsDetail, type PatternsDetailFormDto } from '@tmlmobilidade/go-offer-pckg-types';
import { type ManualRule } from '@tmlmobilidade/go-types-offer';

/* * */

export function getPatternsDetailFormValues(pattern: PatternsDetail): PatternsDetailFormDto {
	return {
		code: pattern.code,
		destination: pattern.destination,
		direction: pattern.direction,
		headsign: pattern.headsign,
		line_id: pattern.line_id,
		origin: pattern.origin,
		parameters: pattern.parameters,
		path: pattern.path,
		route_id: pattern.route_id,
		rules: (pattern.rules ?? []).filter((rule): rule is ManualRule => rule.kind === 'manual'),
		shape: pattern.shape,
	};
}
