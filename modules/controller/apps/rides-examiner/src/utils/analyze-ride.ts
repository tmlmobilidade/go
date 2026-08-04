/* * */

import { atLeastOneVehicleEventOnFirstStopAnalyzer } from '@/analyzers/at-least-one-vehicle-event-on-first-stop.js';
import { atLeastOneVehicleEventOnLastStopAnalyzer } from '@/analyzers/at-least-one-vehicle-event-on-last-stop.js';
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
import { type RideAnalysesRegistry } from '@tmlmobilidade/go-types-operation';

/* * */

const rideAnalysesRegistry: { [K in keyof RideAnalysesRegistry]: (analysisData: AnalysisData) => RideAnalysesRegistry[K] } = {
	atLeastOneVehicleEventOnFirstStop: atLeastOneVehicleEventOnFirstStopAnalyzer,
	atLeastOneVehicleEventOnLastStop: atLeastOneVehicleEventOnLastStopAnalyzer,
	expectedApexValidationInterval: expectedApexValidationIntervalAnalyzer,
	expectedDriverIdQty: expectedDriverIdQtyAnalyzer,
	expectedStartTime: expectedStartTimeAnalyzer,
	expectedVehicleEventDelay: expectedVehicleEventDelayAnalyzer,
	expectedVehicleEventInterval: expectedVehicleEventIntervalAnalyzer,
	expectedVehicleEventQty: expectedVehicleEventQtyAnalyzer,
	expectedVehicleIdQty: expectedVehicleIdQtyAnalyzer,
	matchingApexLocations: matchingApexLocationsAnalyzer,
	matchingVehicleIds: matchingVehicleIdsAnalyzer,
	simpleOneApexValidation: simpleOneApexValidationAnalyzer,
	simpleOneVehicleEventOrApexValidation: simpleOneVehicleEventOrApexValidationAnalyzer,
	simpleThreeVehicleEvents: simpleThreeVehicleEventsAnalyzer,
	transactionSequentiality: transactionSequentialityAnalyzer,
};
//  satisfies {
// 	[K in keyof RideAnalysesRegistry]: (analysisData: AnalysisData) => RideAnalysesRegistry[K];
// };

/* * */

interface AnalyzeRideMetrics {
	complete: string[]
	error: string[]
	is_accepted_false: string[]
	is_accepted_true: string[]
	skipped: string[]
}

interface AnalyzeRideReturnType {
	analyses: typeof rideAnalysesRegistry
	metrics: AnalyzeRideMetrics
}

/**
 * Analyzes the ride data and returns the analysis results.
 * @param analysisData The analysis data to use for the analysis.
 * @returns The analysis results for the ride.
 */
export function analyzeRide(analysisData: AnalysisData): AnalyzeRideReturnType {
	const metrics: AnalyzeRideMetrics = {
		complete: [],
		error: [],
		is_accepted_false: [],
		is_accepted_true: [],
		skipped: [],
	};

	for (const [analyzerName, analyzerFn] of Object.entries(rideAnalysesRegistry)) {
		// Run the analyzer
		const result = analyzerFn(analysisData);
		// Update the metrics
		if (result.processing_status === 'error') metrics.error.push(analyzerName);
		else if (result.processing_status === 'complete') results.complete.push(analyzerName);
		else if (result.processing_status === 'skipped') results.skipped.push(analyzerName);
		if (result.is_accepted) results.is_accepted_true.push(analyzerName);
		else results.is_accepted_false.push(analyzerName);
	}

	return results;
}
