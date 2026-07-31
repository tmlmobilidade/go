/* * */

import { GtfsValidationRule } from './clean/rule.js';

export const gtfsValidationRulesConfig: GtfsValidationRule = {
	agency_email_valid_address: {
		depends_on: ['agency_file_required'],
		severity: 'warning',
	},
	agency_fare_url_valid_url: {
		depends_on: ['agency_file_required'],
		severity: 'warning',
	},
	agency_file_required: {
		severity: 'error',
	},
	agency_id_matched_with_agency_name: {
		depends_on: ['agency_file_required'],
		severity: 'error',
	},
	agency_id_unique: {
		depends_on: ['agency_file_required'],
		severity: 'error',
	},
	agency_lang_valid_language_tag: {
		depends_on: ['agency_file_required'],
		severity: 'ignore',
	},
	agency_name_present: {
		depends_on: ['agency_file_required'],
		severity: 'warning',
	},
	agency_phone_valid_phone_number: {
		depends_on: ['agency_file_required'],
		severity: 'error',
	},
	agency_timezone_valid_id: {
		depends_on: ['agency_file_required'],
		severity: 'error',
	},
	agency_url_valid_url: {
		depends_on: ['agency_file_required'],
		severity: 'error',
	},
	calendar_dates_day_type_valid_input: {
		depends_on: ['calendar_dates_file_required'],
		options: ['1', '2', '3'],
		severity: 'error',
	},
	calendar_dates_exception_date_valid_yyyymmdd: {
		depends_on: ['calendar_dates_file_required'],
		severity: 'error',
	},
	calendar_dates_exception_type_add_or_remove_service: {
		depends_on: ['calendar_dates_file_required'],
		options: ['0', '1'],
		severity: 'error',
	},
	calendar_dates_file_required: {
		severity: 'warning',
	},
	calendar_dates_period_valid_input: {
		depends_on: ['calendar_dates_file_required'],
		options: ['1', '2', '3'],
		severity: 'error',
	},
	calendar_dates_service_id_references_calendar: {
		depends_on: ['calendar_dates_file_required'],
		severity: 'error',
	},
	calendar_end_date_valid_yyyymmdd: {
		depends_on: ['calendar_file_required'],
		severity: 'error',
	},
	calendar_file_required: {
		severity: 'error',
	},
	calendar_friday_valid_input: {
		depends_on: ['calendar_file_required'],
		severity: 'error',
	},
	calendar_monday_valid_input: {
		depends_on: ['calendar_file_required'],
		severity: 'error',
	},
	calendar_saturday_valid_input: {
		depends_on: ['calendar_file_required'],
		severity: 'error',
	},
	calendar_service_id_unique_non_empty: {
		depends_on: ['calendar_file_required'],
		severity: 'error',
	},
	calendar_start_date_valid_yyyymmdd: {
		depends_on: ['calendar_file_required'],
		severity: 'error',
	},
	calendar_sunday_valid_input: {
		depends_on: ['calendar_file_required'],
		severity: 'error',
	},
	calendar_thursday_valid_input: {
		depends_on: ['calendar_file_required'],
		severity: 'error',
	},
	calendar_tuesday_valid_input: {
		depends_on: ['calendar_file_required'],
		severity: 'error',
	},
	calendar_wednesday_valid_input: {
		depends_on: ['calendar_file_required'],
		severity: 'error',
	},
	fare_attributes_agency_id_references_agency_table: {
		depends_on: ['fare_attributes_file_required'],
		severity: 'error',
	},
	fare_attributes_currency_type_valid: {
		depends_on: ['fare_attributes_file_required'],
		options: ['EUR'],
		severity: 'error',
	},
	fare_attributes_file_required: {
		severity: 'warning',
	},
	fare_attributes_payment_method_valid_gtfs_enum: {
		depends_on: ['fare_attributes_file_required'],
		options: ['0'],
		severity: 'error',
	},
	fare_attributes_transfer_duration_valid_seconds_range: {
		depends_on: ['fare_attributes_file_required'],
		severity: 'ignore',
	},
	fare_attributes_transfers_valid_gtfs_enum: {
		depends_on: ['fare_attributes_file_required'],
		options: ['0'],
		severity: 'warning',
	},
	fare_id_unique: {
		depends_on: ['fare_attributes_file_required'],
		severity: 'error',
	},
	fare_price_valid_non_negative_decimal: {
		depends_on: ['fare_attributes_file_required'],
		severity: 'error',
	},
	fare_rules_contains_id_references_zones_stops: {
		depends_on: ['fare_rules_file_required'],
		severity: 'forbidden',
	},
	fare_rules_destination_id_references_zones_stops: {
		depends_on: ['fare_rules_file_required'],
		severity: 'forbidden',
	},
	fare_rules_fare_id_references_fare_attributes: {
		depends_on: ['fare_rules_file_required'],
		severity: 'error',
	},
	fare_rules_file_required: {
		severity: 'warning',
	},
	fare_rules_origin_id_references_zones_stops: {
		depends_on: ['fare_rules_file_required'],
		severity: 'forbidden',
	},
	fare_rules_route_id_references_routes: {
		depends_on: ['fare_rules_file_required'],
		severity: 'error',
	},
	feed_info_contact_email_valid_address: {
		depends_on: ['feed_info_file_required'],
		severity: 'error',
	},
	feed_info_contact_url_valid_http_url: {
		depends_on: ['feed_info_file_required'],
		severity: 'error',
	},
	feed_info_default_lang_matches_feed_lang_when_present: {
		depends_on: ['feed_info_file_required'],
		severity: 'error',
	},
	feed_info_end_date_valid_yyyymmdd_not_before_start: {
		depends_on: ['feed_info_file_required'],
		severity: 'error',
	},
	feed_info_file_required: {
		severity: 'error',
	},
	feed_info_lang_valid_tag: {
		depends_on: ['feed_info_file_required'],
		options: ['pt', 'es'],
		severity: 'error',
	},
	feed_info_publisher_name_non_empty: {
		depends_on: ['feed_info_file_required'],
		severity: 'error',
	},
	feed_info_publisher_url_valid_http_url: {
		depends_on: ['feed_info_file_required'],
		severity: 'error',
	},
	feed_info_remarks: {
		depends_on: ['feed_info_file_required'],
		severity: 'ignore',
	},
	feed_info_start_date_valid_yyyymmdd: {
		depends_on: ['feed_info_file_required'],
		severity: 'error',
	},
	feed_info_type: {
		depends_on: ['feed_info_file_required'],
		options: ['0', '1', '2'],
		severity: 'error',
	},
	feed_info_version_valid_identifier: {
		depends_on: ['feed_info_file_required'],
		severity: 'error',
	},
	frequencies_file_required: {
		severity: 'forbidden',
	},
	routes_agency_id_references_agency_table: {
		depends_on: ['routes_file_required'],
		severity: 'error',
	},
	routes_circular_valid_enum: {
		depends_on: ['routes_file_required'],
		options: ['0', '1'],
		severity: 'error',
	},
	routes_color_valid_hex_string: {
		depends_on: ['routes_file_required'],
		severity: 'error',
	},
	routes_continuous_drop_off_valid_gtfs_enum: {
		depends_on: ['routes_file_required'],
		options: ['0', '1'],
		severity: 'warning',
	},
	routes_continuous_pickup_valid_gtfs_enum: {
		depends_on: ['routes_file_required'],
		options: ['0', '1'],
		severity: 'warning',
	},
	routes_desc_per_severity_and_content_rules: {
		depends_on: ['routes_file_required'],
		severity: 'ignore',
	},
	routes_file_required: {
		severity: 'error',
	},
	routes_id_unique: {
		depends_on: ['routes_file_required'],
		severity: 'error',
	},
	routes_line_id: {
		depends_on: ['routes_file_required'],
		severity: 'error',
	},
	routes_line_long_name: {
		depends_on: ['routes_file_required'],
		severity: 'error',
	},
	routes_line_short_name: {
		depends_on: ['routes_file_required'],
		severity: 'error',
	},
	routes_long_name_or_short_name_present: {
		depends_on: ['routes_file_required'],
		severity: 'error',
	},
	routes_network_id_references_networks_table: {
		depends_on: ['routes_file_required'],
		severity: 'ignore',
	},
	routes_path_type_valid_enum: {
		depends_on: ['routes_file_required'],
		options: ['1', '2', '3'],
		severity: 'error',
	},
	routes_remarks: {
		depends_on: ['routes_file_required'],
		severity: 'ignore',
	},
	routes_school: {
		depends_on: ['routes_file_required'],
		options: ['0', '1'],
		severity: 'warning',
	},
	routes_short_name_or_long_name_present: {
		depends_on: ['routes_file_required'],
		severity: 'error',
	},
	routes_sort_order_non_negative_integer: {
		depends_on: ['routes_file_required'],
		severity: 'ignore',
	},
	routes_text_color_valid_hex_contrast: {
		depends_on: ['routes_file_required'],
		severity: 'error',
	},
	routes_type_valid_gtfs_enum: {
		depends_on: ['routes_file_required'],
		options: ['0', '1', '2', '3', '4', '5', '6', '7', '11', '12'],
		severity: 'error',
	},
	routes_url_valid_http_url: {
		depends_on: ['routes_file_required'],
		severity: 'ignore',
	},
	shapes_block_distance_rows_aggregated: {
		depends_on: ['shapes_file_required'],
		options: ['100.0'],
		severity: 'error',
	},
	shapes_dist_traveled_delta_mismatches_haversine_block: {
		depends_on: ['shapes_file_required'],
		options: ['200.0'],
		severity: 'error',
	},
	shapes_dist_traveled_delta_mismatches_haversine_segment: {
		depends_on: ['shapes_file_required'],
		options: ['100.0'],
		severity: 'error',
	},
	shapes_dist_traveled_non_decreasing_with_sequence: {
		depends_on: ['shapes_file_required'],
		severity: 'error',
	},
	shapes_dist_traveled_non_negative_monotonic: {
		severity: 'error',
	},
	shapes_file_required: {
		severity: 'error',
	},
	shapes_id_and_point_sequence_required: {
		severity: 'error',
	},
	shapes_id_required: {
		severity: 'error',
	},
	shapes_pt_lat_valid_latitude: {
		severity: 'error',
	},
	shapes_pt_lon_valid_longitude: {
		severity: 'error',
	},
	shapes_pt_sequence_not_repeated_within_shape: {
		severity: 'error',
	},
	shapes_pt_sequence_strictly_increasing: {
		severity: 'error',
	},
	shapes_sequence_position_mismatches_cumulative_traveled_distance: {
		severity: 'error',
	},
	stop_headsign_present: {
		depends_on: ['stop_times_file_required'],
		severity: 'forbidden',
	},
	stop_times_arrival_time_ordering_with_departure_and_frequencies: {
		depends_on: ['stop_times_file_required'],
		severity: 'error',
	},
	stop_times_continuous_drop_off_valid_gtfs_enum: {
		depends_on: ['stop_times_file_required'],
		severity: 'warning',
	},
	stop_times_continuous_pickup_valid_gtfs_enum: {
		depends_on: ['stop_times_file_required'],
		severity: 'warning',
	},
	stop_times_departure_time_ordering_with_arrival_and_timepoint: {
		depends_on: ['stop_times_file_required'],
		severity: 'error',
	},
	stop_times_drop_off_booking_rule_id_references_booking_rules_or_empty: {
		depends_on: ['stop_times_file_required'],
		severity: 'ignore',
	},
	stop_times_drop_off_type_valid_gtfs_enum: {
		depends_on: ['stop_times_file_required'],
		severity: 'error',
	},
	stop_times_end_pickup_drop_off_window_valid: {
		depends_on: ['stop_times_file_required'],
		severity: 'ignore',
	},
	stop_times_file_required: {
		severity: 'error',
	},
	stop_times_location_group_id_consistent_with_trip_id_and_stops: {
		depends_on: ['stop_times_file_required'],
		severity: 'error',
	},
	stop_times_pickup_booking_rule_id_references_booking_rules: {
		depends_on: ['stop_times_file_required'],
		severity: 'ignore',
	},
	stop_times_pickup_type_valid_gtfs_enum: {
		depends_on: ['stop_times_file_required'],
		severity: 'error',
	},
	stop_times_shape_dist_traveled_non_decreasing_on_trip: {
		depends_on: ['stop_times_file_required'],
		severity: 'error',
	},
	stop_times_start_pickup_drop_off_window_valid: {
		depends_on: ['stop_times_file_required'],
		severity: 'ignore',
	},
	stop_times_stop_id_references_stops_table: {
		depends_on: ['stop_times_file_required'],
		severity: 'error',
	},
	stop_times_trip_id_references_trips_table: {
		depends_on: ['stop_times_file_required'],
		severity: 'error',
	},
	stops_code_valid: {
		depends_on: ['stops_file_required'],
		severity: 'error',
	},
	stops_desc_valid: {
		depends_on: ['stops_file_required'],
		severity: 'ignore',
	},
	stops_file_required: {
		severity: 'error',
	},
	stops_id_unique: {
		depends_on: ['stops_file_required'],
		severity: 'error',
	},
	stops_lat_valid_latitude_range: {
		depends_on: ['stops_file_required'],
		severity: 'error',
	},
	stops_location_type_valid_enum: {
		depends_on: ['stops_file_required'],
		severity: 'ignore',
	},
	stops_lon_valid_longitude_range: {
		depends_on: ['stops_file_required'],
		severity: 'error',
	},
	stops_name_required_by_location_type: {
		depends_on: ['stops_file_required'],
		severity: 'error',
	},
	stops_parent_station_id_valid_for_stop_hierarchy: {
		depends_on: ['stops_file_required'],
		severity: 'ignore',
	},
	stops_platform_code_valid: {
		depends_on: ['stops_file_required'],
		severity: 'ignore',
	},
	stops_public_visible_valid_enum: {
		depends_on: ['stops_file_required'],
		severity: 'ignore',
	},
	stops_short_name_valid: {
		depends_on: ['stops_file_required'],
		severity: 'ignore',
	},
	stops_timezone_valid: {
		depends_on: ['stops_file_required'],
		severity: 'ignore',
	},
	stops_tts_stop_name_valid: {
		depends_on: ['stops_file_required'],
		severity: 'ignore',
	},
	stops_url_valid_url: {
		depends_on: ['stops_file_required'],
		severity: 'ignore',
	},
	stops_wheelchair_boarding_valid_enum: {
		depends_on: ['stops_file_required'],
		options: ['0', '1', '2'],
		severity: 'warning',
	},
	timepoint_valid_gtfs_enum: {
		depends_on: ['stop_times_file_required'],
		severity: 'warning',
	},
	trips_bikes_allowed_valid_gtfs_enum: {
		depends_on: ['trips_file_required'],
		severity: 'warning',
	},
	trips_block_id_in_allowed_set: {
		depends_on: ['trips_file_required'],
		severity: 'ignore',
	},
	trips_direction_id_consistent_for_all_patterns_in_trips: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_direction_id_matches_feed_pattern_direction: {
		depends_on: ['trips_file_required'],
		severity: 'ignore',
	},
	trips_direction_id_valid_enum: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_file_required: {
		severity: 'error',
	},
	trips_one_pattern_id_per_shape_id_group: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_one_shape_id_per_pattern_id_group: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_pattern_id_matches_feed_pattern_id_syntax: {
		depends_on: ['trips_file_required'],
		options: [
			'^[^_]{1,4}_[^_]_[^_]$',
			'^[^_]{1,4}_[^_]_ASC$',
			'^[^_]{1,4}_[^_]_DESC$',
			'^[^_]{1,4}_[^_]_CIRC$',
		],
		severity: 'error',
	},
	trips_pattern_id_present_and_references_consistent: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_pattern_id_single_trip_signature_per_pattern: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_pattern_id_trip_has_required_fields_for_grouping: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_route_id_consistent_for_all_patterns_in_trips: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_route_id_references_routes_table: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_service_id_references_calendar_service: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_shape_id_needs_to_be_the_same_as_pattern_id: {
		depends_on: ['trips_file_required'],
		severity: 'warning',
	},
	trips_shape_id_references_shapes_table_when_present: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_stop_sequence_increasing_by_one_along_trip: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_trip_headsign_consistent_for_all_patterns_in_trips: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_trip_headsign_present_when_short_name_absent: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_trip_id_limit_max_length: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_trip_id_unique: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_trip_path_stop_coordinates_referenced_from_stops: {
		depends_on: ['trips_file_required'],
		severity: 'error',
	},
	trips_trip_short_name_exclusivity: {
		depends_on: ['trips_file_required'],
		severity: 'ignore',
	},
	trips_wheelchair_accessible_valid_gtfs_enum: {
		depends_on: ['trips_file_required'],
		severity: 'warning',
	},
	vehicles_file_required: {
		severity: 'error',
	},
};
