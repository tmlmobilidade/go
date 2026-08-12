/* * */

import { type SimplifiedApexBankingTap, type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { type HashedTrip, type Ride } from '@tmlmobilidade/go-types-operation';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export interface AnalysisData {
	apex_banking_taps: SimplifiedApexBankingTap[]
	apex_locations: SimplifiedApexLocation[]
	apex_refunds: SimplifiedApexOnBoardRefund[]
	apex_sales: SimplifiedApexOnBoardSale[]
	apex_validations: SimplifiedApexValidation[]
	hashed_trip: HashedTrip[]
	ride: Ride
	vehicle_events: SimplifiedVehicleEvent[]
}
