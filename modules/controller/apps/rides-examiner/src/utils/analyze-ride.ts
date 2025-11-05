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
import { type Ride } from '@go/types';

/**
 * Analyzes the ride data and returns the analysis results.
 * @param analysisData The analysis data to use for the analysis.
 * @returns The analysis results for the ride.
 */
export function analyzeRide(analysisData: AnalysisData): Ride['analysis'] {
	return {
		AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP: atLeastOneVehicleEventOnFirstStopAnalyzer(analysisData),
		ENDED_AT_LAST_STOP: endedAtLastStopAnalyzer(analysisData),
		EXPECTED_APEX_VALIDATION_INTERVAL: expectedApexValidationIntervalAnalyzer(analysisData),
		EXPECTED_DRIVER_ID_QTY: expectedDriverIdQtyAnalyzer(analysisData),
		EXPECTED_START_TIME: expectedStartTimeAnalyzer(analysisData),
		EXPECTED_VEHICLE_EVENT_DELAY: expectedVehicleEventDelayAnalyzer(analysisData),
		EXPECTED_VEHICLE_EVENT_INTERVAL: expectedVehicleEventIntervalAnalyzer(analysisData),
		EXPECTED_VEHICLE_EVENT_QTY: expectedVehicleEventQtyAnalyzer(analysisData),
		EXPECTED_VEHICLE_ID_QTY: expectedVehicleIdQtyAnalyzer(analysisData),
		MATCHING_APEX_LOCATIONS: matchingApexLocationsAnalyzer(analysisData),
		MATCHING_VEHICLE_IDS: matchingVehicleIdsAnalyzer(analysisData),
		SIMPLE_ONE_APEX_VALIDATION: simpleOneApexValidationAnalyzer(analysisData),
		SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION: simpleOneVehicleEventOrApexValidationAnalyzer(analysisData),
		SIMPLE_THREE_VEHICLE_EVENTS: simpleThreeVehicleEventsAnalyzer(analysisData),
		TRANSACTION_SEQUENTIALITY: transactionSequentialityAnalyzer(analysisData),
	};
}
