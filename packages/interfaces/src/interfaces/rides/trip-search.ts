/* * */

/** Middle segment must look like an explicit “any” placeholder (not a literal like `2400`). */
const WILDCARD_MIDDLE = /^(\.{3,}|…|\*)$/u;

/** Strip `v:` / `d:` list tokens so trip wildcard parsing matches {@link ridesBatchAggregationPipeline} search handling. */
export function ridesSearchStripVehicleDriverTokens(search: string): string {
	return search.replace(/v:[\d,]+/g, '').replace(/d:[\d,]+/g, '').trim();
}

/**
 * Trip wildcard search: `first|wildcard|last` with exactly three segments and a wildcard middle
 * (`...`, `…`, or `*`), e.g. `4632_0_1|...|0835` → matches `trip_id` / `_id` suffix
 * `4632_0_1|anything|0835`. A literal middle (`4632_0_1|2400|0835`) returns null so callers use
 * default `_id` keyword search.
 *
 * Full ride `_id` is `{plan}-{agency}-{yyyyMMdd}-{trip_id}`. When that suffix is present at the
 * end of the string, extract `{trip_id}` first, then check the triple shape.
 */
export function tripQuery(searchInput: string): null | { tripCorePattern: string } {
	const normalized = searchInput.replace(/\uFF5C/g, '|').trim();
	if (!normalized) return null;

	const tryBuildFromCandidate = (candidate: string): null | { tripCorePattern: string } => {
		const trimmed = candidate.trim();
		if (!trimmed) return null;
		const tripParts = trimmed.split('|').map(part => part.trim());
		const [firstPart, middlePart, lastPart] = tripParts;
		if (tripParts.length !== 3 || !firstPart || !middlePart || !lastPart) return null;
		if (!WILDCARD_MIDDLE.test(middlePart)) return null;
		const escapeRegexToken = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const first = escapeRegexToken(firstPart);
		const last = escapeRegexToken(lastPart);
		return { tripCorePattern: `${first}\\|.*\\|${last}` };
	};

	const embedded = normalized.match(/-(\d{8})-(.+)$/);
	if (embedded) {
		const fromRideId = tryBuildFromCandidate(embedded[2] ?? '');
		if (fromRideId) return fromRideId;
	}

	return tryBuildFromCandidate(normalized);
}

export function isTripWildcardQuery(search: string): boolean {
	return tripQuery(search) !== null;
}
