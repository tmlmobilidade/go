/* * */

import { type Ride, type RideAcceptance, type RideAnalysis } from '@tmlmobilidade/types';
import { Dates, generateRandomString } from '@tmlmobilidade/utils';

export function getRideAcceptanceDecision(rideAnalysis: Ride['analysis']): RideAcceptance {
	//

	//
	// To consider a Ride as 'accepted' the analysis needs
	// to have a passing grade on the following tests

	const requiredTests: RideAnalysis['grade'][] = [];

	requiredTests.push(rideAnalysis.AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP.grade);
	requiredTests.push(rideAnalysis.ENDED_AT_LAST_STOP.grade);

	const allRequiredTestsArePass = requiredTests.every(item => item === 'pass');

	if (allRequiredTestsArePass) {
		return {
			_id: generateRandomString(),
			analysis_summary: {},
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			created_by: null,
			mode: 'auto',
			status: 'accepted',
		};
	}

	//
	// If not all tests are pass,
	// then the Ride needs to be justified

	return {
		_id: generateRandomString(),
		analysis_summary: {},
		created_at: Dates.now('Europe/Lisbon').unix_timestamp,
		created_by: null,
		mode: 'auto',
		status: 'justification_required',
	};

	//
}
