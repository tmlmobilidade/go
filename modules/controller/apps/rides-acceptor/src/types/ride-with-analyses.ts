/* * */

import { type GradeStatus, type OperationalStatus } from '@tmlmobilidade/go-types-shared';

/* * */

export const REQUIRED_ANALYSES = [
	'simple_three_vehicle_events',
] as const;

export type RequiredAnalysis = typeof REQUIRED_ANALYSES[number];

export interface RideAnalysisResult {
	grade: GradeStatus | null
	reason: null | string
}

export interface RideWithAnalyses {
	_id: string
	analysis: Partial<Record<RequiredAnalysis, RideAnalysisResult>>
	operational_status: OperationalStatus
}
