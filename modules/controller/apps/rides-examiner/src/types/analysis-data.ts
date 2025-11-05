/* * */

import { type HashedShape, type HashedTrip, type Ride, type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation, type VehicleEvent } from '@tmlmobilidade/go-types';

/* * */

export interface AnalysisData {
	hashed_shape: HashedShape
	hashed_trip: HashedTrip
	ride: Ride
	simplified_apex_locations: SimplifiedApexLocation[]
	simplified_apex_on_board_refunds: SimplifiedApexOnBoardRefund[]
	simplified_apex_on_board_sales: SimplifiedApexOnBoardSale[]
	simplified_apex_validations: SimplifiedApexValidation[]
	vehicle_events: VehicleEvent[]
}
