/* * */

interface PatternMetricIdentity {
	_id: string
	code: string
}

/* * */

export function appendPatternMetricCodes(query: URLSearchParams, patterns: PatternMetricIdentity[]) {
	patterns.forEach(pattern => query.append('pattern_ids', pattern.code));
	return query;
}

export function getPatternMetricValueByCode(
	demandByPatternCode: Map<string, number>,
	pattern: PatternMetricIdentity,
) {
	return demandByPatternCode.get(pattern.code) ?? null;
}
