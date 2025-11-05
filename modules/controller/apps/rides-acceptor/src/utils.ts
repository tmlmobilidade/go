import { Ride, RideAnalysis, RideAnalysisSummary } from '@tmlmobilidade/go-types';

/* * */

export const REQUIRED_TESTS = ['SIMPLE_THREE_VEHICLE_EVENTS'];

/* * */

/**
 * This function tests a ride by running a set of required tests and returning a summary of the results.
 * @param ride_analysis The ride analysis to test.
 * @param requiredTests The tests to run.
 * @returns A tuple containing a boolean indicating if all required tests passed and a summary of the results to be used for the ride acceptance.
 */
export function testRide(ride_analysis: Ride['analysis']): [boolean, RideAnalysisSummary] {
	const summaryEntries: [string, RideAnalysis][] = [];

	for (const test of REQUIRED_TESTS) {
		const analysis = ride_analysis[test] ?? { grade: 'fail', message: 'Test was not found for this ride', reason: test };
		summaryEntries.push([test, analysis]);
	}

	const requiredTestsSummary: RideAnalysisSummary = Object.fromEntries(summaryEntries);

	const allRequiredTestsArePass = REQUIRED_TESTS.every((test) => {
		const analysis = ride_analysis[test];
		return analysis?.grade === 'pass';
	});

	return [allRequiredTestsArePass, requiredTestsSummary];
}

/**
 * Checks if an object is empty.
 * An object is considered empty if it has no own enumerable properties.
 *
 * @param obj - The object to check for emptiness.
 * @returns {boolean} - Returns true if the object is empty, otherwise false.
 */
export function isEmpty(obj) {
	for (const prop in obj) {
		if (Object.hasOwn(obj, prop)) {
			return false;
		}
	}
	return true;
}
