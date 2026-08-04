/* * */

import { atLeastOneVehicleEventOnFirstStopAnalyzer } from '@/analyzers/at-least-one-vehicle-event-on-first-stop.js';
import { endedAtLastStopAnalyzer } from '@/analyzers/ended-at-last-stop.js';
import { expectedApexValidationIntervalAnalyzer } from '@/analyzers/expected-apex-validation-interval.js';
import { expectedDriverIdQtyAnalyzer } from '@/analyzers/expected-driver-id-qty.js';
import { expectedStartTimeAnalyzer } from '@/analyzers/expected-start-time.js';
import { expectedVehicleEventDelayAnalyzer } from '@/analyzers/expected-vehicle-event-delay.js';
import { expectedVehicleEventIntervalAnalyzer } from '@/analyzers/expected-vehicle-event-interval.js';
import { expectedVehicleEventQtyAnalyzer } from '@/analyzers/expected-vehicle-event-qty.js';
import { expectedVehicleIdQtyAnalyzer } from '@/analyzers/expected-vehicle-id-qty.js';
import { matchingApexLocationsAnalyzer } from '@/analyzers/matching-apex-locations.js';
import { matchingVehicleIdsAnalyzer } from '@/analyzers/matching-vehicle-ids.js';
import { simpleOneApexValidationAnalyzer } from '@/analyzers/simple-one-apex-validation.js';
import { simpleOneVehicleEventOrApexValidationAnalyzer } from '@/analyzers/simple-one-vehicle-event-or-apex-validation.js';
import { simpleThreeVehicleEventsAnalyzer } from '@/analyzers/simple-three-vehicle-events.js';
import { transactionSequentialityAnalyzer } from '@/analyzers/transaction-sequentiality.js';
import { type AnalysisData } from '@/types/analysis-data.js';

/* * */

interface AnalyzeRideResults {
	error: string[]
	failed: string[]
	passed: string[]
	skipped: string[]
}

/**
 * Analyzes the ride data and returns the analysis results.
 * @param analysisData The analysis data to use for the analysis.
 * @returns The analysis results for the ride.
 */
export function analyzeRide(analysisData: AnalysisData): AnalyzeRideResults {
	const results: AnalyzeRideResults = {
		error: [],
		failed: [],
		passed: [],
		skipped: [],
	};

	atLeastOneVehicleEventOnFirstStopAnalyzer(analysisData);
	endedAtLastStopAnalyzer(analysisData);
	expectedApexValidationIntervalAnalyzer(analysisData);
	expectedDriverIdQtyAnalyzer(analysisData);
	expectedStartTimeAnalyzer(analysisData);
	expectedVehicleEventDelayAnalyzer(analysisData);
	expectedVehicleEventIntervalAnalyzer(analysisData);
	expectedVehicleEventQtyAnalyzer(analysisData);
	expectedVehicleIdQtyAnalyzer(analysisData);
	matchingApexLocationsAnalyzer(analysisData);
	matchingVehicleIdsAnalyzer(analysisData);
	simpleOneApexValidationAnalyzer(analysisData);
	simpleOneVehicleEventOrApexValidationAnalyzer(analysisData);
	simpleThreeVehicleEventsAnalyzer(analysisData);
	transactionSequentialityAnalyzer(analysisData);

	return results;
}
