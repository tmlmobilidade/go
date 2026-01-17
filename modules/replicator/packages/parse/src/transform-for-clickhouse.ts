/* * */

import type { SimplifiedApexValidation } from '@tmlmobilidade/types';
import type { SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

/**
 * Transform a SimplifiedApexValidation document for ClickHouse insertion.
 * Handles type conversions (booleans to integers) and ensures proper null handling.
 */
export function transformApexValidationForClickHouse(doc: SimplifiedApexValidation): Record<string, unknown> {
	return {
		_id: doc._id,
		agency_id: doc.agency_id,
		apex_version: doc.apex_version,
		card_serial_number: doc.card_serial_number,
		category: doc.category,
		created_at: doc.created_at,
		device_id: doc.device_id,
		event_type: doc.event_type,
		is_passenger: doc.is_passenger ? 1 : 0, // Convert boolean to UInt8
		line_id: doc.line_id,
		mac_ase_counter_value: doc.mac_ase_counter_value,
		mac_sam_serial_number: doc.mac_sam_serial_number,
		on_board_refund_id: doc.on_board_refund_id ?? null,
		on_board_sale_id: doc.on_board_sale_id ?? null,
		pattern_id: doc.pattern_id,
		product_id: doc.product_id,
		received_at: doc.received_at,
		stop_id: doc.stop_id,
		trip_id: doc.trip_id,
		units_qty: doc.units_qty ?? null,
		updated_at: doc.updated_at,
		validation_status: doc.validation_status,
		vehicle_id: doc.vehicle_id,
	};
}

/**
 * Transform a SimplifiedVehicleEvent document for ClickHouse insertion.
 * Flattens the nested position object and handles type conversions.
 */
export function transformVehicleEventForClickHouse(doc: SimplifiedVehicleEvent): Record<string, unknown> {
	return {
		_id: doc._id,
		agency_id: doc.agency_id,
		created_at: doc.created_at,
		current_status: doc.current_status,
		driver_id: doc.driver_id,
		event_id: doc.event_id,
		extra_trip_id: doc.extra_trip_id ?? null,
		latitude: doc.latitude,
		longitude: doc.longitude,
		odometer: doc.odometer,
		pattern_id: doc.pattern_id,
		// Flatten nested position object
		position_geohash: doc.position.geohash,
		position_h3: doc.position.h3,
		position_latitude: doc.position.latitude,
		position_longitude: doc.position.longitude,
		received_at: doc.received_at,
		stop_id: doc.stop_id,
		trigger_activity: doc.trigger_activity,
		trigger_door: doc.trigger_door,
		trip_id: doc.trip_id,
		updated_at: doc.updated_at,
		vehicle_id: doc.vehicle_id,
	};
}
