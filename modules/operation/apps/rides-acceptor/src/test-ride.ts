/* * */

import { RideAcceptance } from '@tmlmobilidade/go-types-operation';

import { REQUIRED_ANALYSES, type RideWithAnalyses } from './types/ride-with-analyses.js';

/* * */

export function testRide(ride: RideWithAnalyses): { analysisSummary: RideAcceptance['analysis_summary'], pass: boolean } {
	const analysisSummary = Object.fromEntries(
		REQUIRED_ANALYSES.map((analysis) => {
			const result = ride.analysis[analysis];

			return [analysis, {
				grade: result?.grade ?? 'fail',
				reason: result?.reason ?? `Required analysis missing: ${analysis}`,
			}];
		}),
	);

	const pass = REQUIRED_ANALYSES.every(analysis => ride.analysis[analysis]?.grade === 'pass');

	return { analysisSummary, pass };
}
