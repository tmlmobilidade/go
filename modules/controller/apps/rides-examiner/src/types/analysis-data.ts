/* * */

import { type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { type HashedTrip, type Ride } from '@tmlmobilidade/go-types-operation';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export interface AnalysisData {
	hashed_path: HashedTrip[]
	ride: Ride
	simplified_apex_locations: SimplifiedApexLocation[]
	simplified_apex_on_board_refunds: SimplifiedApexOnBoardRefund[]
	simplified_apex_on_board_sales: SimplifiedApexOnBoardSale[]
	simplified_apex_validations: SimplifiedApexValidation[]
	vehicle_events: SimplifiedVehicleEvent[]
}
