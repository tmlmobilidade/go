/* * */

import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { type GradeStatus, GradeStatusSchema } from '@tmlmobilidade/go-types-shared';

import { REQUIRED_ANALYSES, type RideWithAnalyses } from './types/ride-with-analyses.js';

/* * */

export function testRide(ride: RideWithAnalyses): { analysisSummary: RideAcceptance['analysis_summary'], pass: boolean } {
	const analysisSummary = Object.fromEntries(
		REQUIRED_ANALYSES.map((analysis) => {
			const result = ride.analysis[analysis];
			const grade = GradeStatusSchema.safeParse(result?.grade);
			const fallbackReason = result?.grade && !grade.success
				? `Invalid grade for required analysis: ${analysis}`
				: `Required analysis missing: ${analysis}`;

			return [analysis, {
				grade: grade.success ? grade.data : 'fail',
				reason: result?.reason || fallbackReason,
			}];
		}),
	);

	const pass = REQUIRED_ANALYSES.every(analysis => analysisSummary[analysis].grade === 'pass');

	return { analysisSummary, pass };
}
