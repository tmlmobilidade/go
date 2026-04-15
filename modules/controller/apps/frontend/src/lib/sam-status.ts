import { type Sam, type SystemStatus } from '@tmlmobilidade/types';

export function getSamSystemStatus(sam: Sam): SystemStatus {
	const analyses = sam.analysis ?? [];
	if (!analyses.length) return 'error';

	const isNullish = (value: unknown) => value === null || value === undefined;

	const allAnalysesAreFullyNull = analyses.every(analysis =>
		Object.values(analysis).every(isNullish),
	);
	if (allAnalysesAreFullyNull) return 'error';

	const hasAnyNullFieldInAnyAnalysis = analyses.some(analysis =>
		Object.values(analysis).some(isNullish),
	);
	if (hasAnyNullFieldInAnyAnalysis) return 'incomplete';

	return 'complete';
}
