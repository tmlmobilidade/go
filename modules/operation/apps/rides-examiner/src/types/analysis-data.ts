/* * */

import { type SimplifiedApexBankingTap, type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { type HashedShape, type HashedTrip, type Ride } from '@tmlmobilidade/go-types-operation';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export type PickedSimplifiedApexBankingTap = Pick<
	SimplifiedApexBankingTap,
	| 'group_dimension'
	| 'mac_ase_counter_value'
	| 'mac_sam_serial_number'
	| 'vehicle_id'
>;

export type PickedSimplifiedApexLocation = Pick<
	SimplifiedApexLocation,
	| 'mac_ase_counter_value'
	| 'mac_sam_serial_number'
	| 'stop_id'
	| 'vehicle_id'
>;

export type PickedSimplifiedApexOnBoardRefund = Pick<
	SimplifiedApexOnBoardRefund,
	| 'mac_ase_counter_value'
	| 'mac_sam_serial_number'
	| 'price'
	| 'vehicle_id'
>;

export type PickedSimplifiedApexOnBoardSale = Pick<
	SimplifiedApexOnBoardSale,
	| 'is_passenger'
	| 'mac_ase_counter_value'
	| 'mac_sam_serial_number'
	| 'price'
	| 'vehicle_id'
>;

export type PickedSimplifiedApexValidation = Pick<
	SimplifiedApexValidation,
	| 'category'
	| 'created_at'
	| 'is_passenger'
	| 'mac_ase_counter_value'
	| 'mac_sam_serial_number'
	| 'units_qty'
	| 'vehicle_id'
>;

export type PickedHashedShape = Pick<
	HashedShape,
	'shape_polyline'
>;

export type PickedHashedTrip = Pick<
	HashedTrip,
	| 'stop_id'
	| 'stop_lat'
	| 'stop_lon'
	| 'stop_sequence'
>;

export type PickedSimplifiedVehicleEvent = Pick<
	SimplifiedVehicleEvent,
	| 'created_at'
	| 'driver_id'
	| 'latitude'
	| 'longitude'
	| 'odometer'
	| 'received_at'
	| 'stop_id'
	| 'vehicle_id'
>;

/* * */

export interface AnalysisData {
	apex_banking_taps: PickedSimplifiedApexBankingTap[]
	apex_locations: PickedSimplifiedApexLocation[]
	apex_refunds: PickedSimplifiedApexOnBoardRefund[]
	apex_sales: PickedSimplifiedApexOnBoardSale[]
	apex_validations: PickedSimplifiedApexValidation[]
	hashed_shape: null | PickedHashedShape
	hashed_trip: PickedHashedTrip[]
	ride: Ride
	vehicle_events: PickedSimplifiedVehicleEvent[]
}
