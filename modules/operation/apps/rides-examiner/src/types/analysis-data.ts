/* * */

import { type SimplifiedApexBankingTap, type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { type HashedShape, type HashedTrip, type Ride } from '@tmlmobilidade/go-types-operation';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export type PickedHashedShape = Pick<HashedShape, 'shape_polyline'>;
export type PickedHashedTrip = Pick<HashedTrip, 'stop_id' | 'stop_lat' | 'stop_lon' | 'stop_sequence'>;

/* * */

export interface AnalysisData {
	apex_banking_taps: SimplifiedApexBankingTap[]
	apex_locations: SimplifiedApexLocation[]
	apex_refunds: SimplifiedApexOnBoardRefund[]
	apex_sales: SimplifiedApexOnBoardSale[]
	apex_validations: SimplifiedApexValidation[]
	hashed_shape: null | PickedHashedShape
	hashed_trip: PickedHashedTrip[]
	ride: Ride
	vehicle_events: SimplifiedVehicleEvent[]
}
