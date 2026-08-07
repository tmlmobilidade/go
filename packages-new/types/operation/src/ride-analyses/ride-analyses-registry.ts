/* * */

import { z } from 'zod';

import { RideAnalysisAtLeastOneVehicleEventOnFirstStopSchema } from './at-least-one-vehicle-event-on-first-stop.js';
import { RideAnalysisAtLeastOneVehicleEventOnLastStopSchema } from './at-least-one-vehicle-event-on-last-stop.js';
import { RideAnalysisExpectedApexValidationIntervalSchema } from './expected-apex-validation-interval.js';
import { RideAnalysisExpectedDriverIdQtySchema } from './expected-driver-id-qty.js';
import { RideAnalysisExpectedStartTimeSchema } from './expected-start-time.js';
import { RideAnalysisExpectedVehicleEventDelaySchema } from './expected-vehicle-event-delay.js';
import { RideAnalysisExpectedVehicleEventIntervalSchema } from './expected-vehicle-event-interval.js';
import { RideAnalysisExpectedVehicleEventQtySchema } from './expected-vehicle-event-qty.js';
import { RideAnalysisExpectedVehicleIdQtySchema } from './expected-vehicle-id-qty.js';
import { RideAnalysisMatchingApexLocationsSchema } from './matching-apex-locations.js';
import { RideAnalysisMatchingVehicleIdsSchema } from './matching-vehicle-ids.js';
import { RideAnalysisSimpleOneApexValidationSchema } from './simple-one-apex-validation.js';
import { RideAnalysisSimpleOneVehicleEventOrApexValidationSchema } from './simple-one-vehicle-event-or-apex-validation.js';
import { RideAnalysisSimpleThreeVehicleEventsSchema } from './simple-three-vehicle-events.js';
import { RideAnalysisTransactionSequentialitySchema } from './transaction-sequentiality.js';

/* * */

export const RideAnalysesRegistrySchema = z.object({
	atLeastOneVehicleEventOnFirstStop: RideAnalysisAtLeastOneVehicleEventOnFirstStopSchema,
	atLeastOneVehicleEventOnLastStop: RideAnalysisAtLeastOneVehicleEventOnLastStopSchema,
	expectedApexValidationInterval: RideAnalysisExpectedApexValidationIntervalSchema,
	expectedDriverIdQty: RideAnalysisExpectedDriverIdQtySchema,
	expectedStartTime: RideAnalysisExpectedStartTimeSchema,
	expectedVehicleEventDelay: RideAnalysisExpectedVehicleEventDelaySchema,
	expectedVehicleEventInterval: RideAnalysisExpectedVehicleEventIntervalSchema,
	expectedVehicleEventQty: RideAnalysisExpectedVehicleEventQtySchema,
	expectedVehicleIdQty: RideAnalysisExpectedVehicleIdQtySchema,
	matchingApexLocations: RideAnalysisMatchingApexLocationsSchema,
	matchingVehicleIds: RideAnalysisMatchingVehicleIdsSchema,
	simpleOneApexValidation: RideAnalysisSimpleOneApexValidationSchema,
	simpleOneVehicleEventOrApexValidation: RideAnalysisSimpleOneVehicleEventOrApexValidationSchema,
	simpleThreeVehicleEvents: RideAnalysisSimpleThreeVehicleEventsSchema,
	transactionSequentiality: RideAnalysisTransactionSequentialitySchema,
});

/**
 * The registry of ride analyses.
 */
export type RideAnalysesRegistry = z.infer<typeof RideAnalysesRegistrySchema>;
