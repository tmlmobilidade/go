/* * */

import { type GradeStatus, type OperationalStatus } from '@tmlmobilidade/go-types-shared';

/**
 * This function returns the analysis grade for a given Ride, based on its operational status and the provided grade.
 * @param operationalStatus The operational status of the Ride.
 * @param grade The grade to return if the operational status is not 'scheduled' or 'running'.
 * @returns The analysis grade for the Ride.
 */
export function getAnalysisGrade(operationalStatus: OperationalStatus, grade?: GradeStatus | null): 'none' | GradeStatus {
	//

	if (operationalStatus === 'scheduled' || operationalStatus === 'running') {
		return 'none';
	}

	return grade ?? 'none';
}
