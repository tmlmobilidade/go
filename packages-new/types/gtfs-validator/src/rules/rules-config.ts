/* * */

import type { GtfsValidationRule } from '@/rules/rule.js';

/* * */

export const gtfsValidationRulesConfig = {
	agency_email_valid_address: {
		depends_on: [
			'agency_file_required',
		],
		severity: 'warning',
	},
	agency_fare_url_valid_url: {
		depends_on: [
			'agency_file_required',
		],
		severity: 'warning',
	},
	agency_file_required: {
		severity: 'error',
	},
	agency_id: {
		depends_on: [
			'attributions_file_required',
		],
		severity: 'ignore',
	},
	agency_id_matched_with_agency_name: {
		compare: [
			{
				key: '0',
				value: 'Área Metropolitana de Lisboa',
			},
			{
				key: '1',
				value: 'Carris',
			},
			{
				key: '2',
				value: 'Metropolitano de Lisboa',
			},
			{
				key: '3',
				value: 'Comboios de Portugal',
			},
			{
				key: '4',
				value: 'TTSL - Transtejo Soflusa',
			},
			{
				key: '5',
				value: 'Transportes Sul do Tejo',
			},
			{
				key: '6',
				value: 'Rodoviária de Lisboa',
			},
			{
				key: '7',
				value: 'Soflusa',
			},
			{
				key: '8',
				value: 'Transportes Colectivos do Barreiro',
			},
			{
				key: '9',
				value: 'Vimeca Transportes',
			},
			{
				key: '10',
				value: 'Scotturb',
			},
			{
				key: '11',
				value: 'ID/JJ/HLM',
			},
			{
				key: '12',
				value: 'Isidoro Duarte',
			},
			{
				key: '13',
				value: 'Barraqueiro Transportes',
			},
			{
				key: '14',
				value: 'Joaquim Jerónimo',
			},
			{
				key: '15',
				value: 'Fertagus',
			},
			{
				key: '16',
				value: 'Metro Transportes do Sul',
			},
			{
				key: '18',
				value: 'Henrique Leonardo da Mota',
			},
			{
				key: '21',
				value: 'Cascais Próxima',
			},
			{
				key: '23',
				value: 'Portal VIVA',
			},
			{
				key: '24',
				value: 'Rodoviária do Tejo',
			},
			{
				key: '34',
				value: 'Câmara Municipal de Lisboa',
			},
			{
				key: '41',
				value: 'Viação Alvorada',
			},
			{
				key: '42',
				value: 'Rodoviária de Lisboa',
			},
			{
				key: '43',
				value: 'Transportes Sul do Tejo',
			},
			{
				key: '44',
				value: 'Alsa Todi',
			},
			{
				key: '49',
				value: 'Município de Oeiras',
			},
			{
				key: '54',
				value: 'Municipio de Setúbal',
			},
			{
				key: 'crtm',
				value: 'Consorcio Regional de Transportes de Madrid',
			},
		],
		depends_on: [
			'agency_file_required',
		],
		severity: 'error',
	},
	agency_id_unique: {
		depends_on: [
			'agency_file_required',
		],
		options: [
			'0',
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'10',
			'11',
			'12',
			'13',
			'14',
			'15',
			'16',
			'18',
			'21',
			'23',
			'24',
			'34',
			'41',
			'42',
			'43',
			'44',
			'49',
			'54',
			'crtm',
		],
		severity: 'error',
	},
	agency_lang_valid_language_tag: {
		depends_on: [
			'agency_file_required',
		],
		severity: 'ignore',
	},
	agency_name_present: {
		depends_on: [
			'agency_file_required',
		],
		options: [
			'Área Metropolitana de Lisboa',
			'Carris',
			'Metropolitano de Lisboa',
			'Comboios de Portugal',
			'TTSL - Transtejo Soflusa',
			'Transportes Sul do Tejo',
			'Rodoviária de Lisboa',
			'Soflusa',
			'Transportes Coletivos do Barreiro',
			'Vimeca Transportes',
			'Scotturb',
			'ID/JJ/HLM',
			'Isidoro Duarte',
			'Barraqueiro Transportes',
			'Joaquim Jerónimo',
			'Fertagus',
			'Metro Transportes do Sul',
			'Henrique Leonardo da Mota',
			'Cascais Próxima',
			'Portal VIVA',
			'Rodoviária do Tejo',
			'Câmara Municipal de Lisboa',
			'Viação Alvorada',
			'Alsa Todi',
			'Município de Oeiras',
			'Municipio de Setúbal',
			'Consorcio Regional de Transportes de Madrid',
		],
		severity: 'warning',
	},
	agency_phone_valid_phone_number: {
		depends_on: [
			'agency_file_required',
		],
		severity: 'error',
	},
	agency_timezone_valid_id: {
		depends_on: [
			'agency_file_required',
		],
		severity: 'error',
	},
	agency_url_valid_url: {
		depends_on: [
			'agency_file_required',
		],
		severity: 'error',
	},
	arrival_departure_time_non_decreasing_by_stop_sequence: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'error',
	},
	arrival_time_ordering_with_departure_and_frequencies: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'error',
	},
	at_most_one_default_fare_category: {
		depends_on: [
			'rider_categories_file_required',
		],
		severity: 'ignore',
	},
	attribution_email: {
		depends_on: [
			'attributions_file_required',
		],
		severity: 'ignore',
	},
	attribution_id: {
		depends_on: [
			'attributions_file_required',
		],
		severity: 'ignore',
	},
	attribution_phone: {
		depends_on: [
			'attributions_file_required',
		],
		severity: 'ignore',
	},
	attribution_url: {
		depends_on: [
			'attributions_file_required',
		],
		severity: 'ignore',
	},
	attributions_file_required: {
		severity: 'ignore',
	},
	available_seats_non_negative: {
		depends_on: [
			'vehicles_file_required',
		],
		severity: 'error',
	},
	available_standing_non_negative: {
		depends_on: [
			'vehicles_file_required',
		],
		severity: 'error',
	},
	bicycles_rack_count_non_negative: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	bikes_allowed_valid_gtfs_enum: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'warning',
	},
	block_id_in_allowed_set: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'ignore',
	},
	calendar_dates_file_required: {
		severity: 'ignore',
	},
	calendar_dates_service_id_references_calendar: {
		depends_on: [
			'calendar_dates_file_required',
		],
		severity: 'error',
	},
	calendar_end_date_valid_yyyymmdd: {
		depends_on: [
			'calendar_file_required',
		],
		severity: 'error',
	},
	calendar_file_required: {
		severity: 'ignore',
	},
	calendar_service_id_unique_non_empty: {
		depends_on: [
			'calendar_file_required',
		],
		severity: 'error',
	},
	calendar_start_date_valid_yyyymmdd: {
		depends_on: [
			'calendar_file_required',
		],
		severity: 'error',
	},
	circular: {
		depends_on: [
			'routes_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	climatization_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	consumption_meter_valid_format: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	continuous_drop_off_valid_gtfs_enum: {
		depends_on: [
			'routes_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'warning',
	},
	continuous_pickup_valid_gtfs_enum: {
		depends_on: [
			'routes_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'warning',
	},
	currency_type_valid: {
		depends_on: [
			'fare_attributes_file_required',
		],
		options: [
			'EUR',
		],
		severity: 'error',
	},
	day_type: {
		depends_on: [
			'calendar_dates_file_required',
		],
		options: [
			'1',
			'2',
			'3',
		],
		severity: 'error',
	},
	default_lang_matches_feed_lang_when_present: {
		depends_on: [
			'feed_info_file_required',
		],
		severity: 'error',
	},
	departure_time_ordering_with_arrival_and_timepoint: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'error',
	},
	direction_id_consistent_for_all_patterns_in_trips: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	direction_id_matches_feed_pattern_direction: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'ignore',
	},
	direction_id_valid_enum: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	drop_off_booking_rule_id_references_booking_rules_or_empty: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'ignore',
	},
	drop_off_type_valid_gtfs_enum: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'error',
	},
	eligibility_url_valid_http_url: {
		depends_on: [
			'rider_categories_file_required',
		],
		severity: 'ignore',
	},
	emission_code_valid_for_propulsion_type: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'0',
		],
		severity: 'error',
	},
	end_pickup_drop_off_window_valid: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'ignore',
	},
	exact_times_zero_when_timed_trip_uses_frequencies: {
		depends_on: [
			'frequencies_file_required',
		],
		severity: 'error',
	},
	exception_date_valid_yyyymmdd: {
		depends_on: [
			'calendar_dates_file_required',
		],
		severity: 'error',
	},
	exception_type_add_or_remove_service: {
		depends_on: [
			'calendar_dates_file_required',
		],
		severity: 'error',
	},
	external_sound_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	fare_attributes_agency_id_references_agency_table: {
		depends_on: [
			'fare_attributes_file_required',
		],
		severity: 'error',
	},
	fare_attributes_file_required: {
		severity: 'warning',
	},
	fare_id_unique: {
		depends_on: [
			'fare_attributes_file_required',
		],
		severity: 'error',
	},
	fare_media_file_required: {
		severity: 'ignore',
	},
	fare_media_id_unique: {
		depends_on: [
			'fare_media_file_required',
		],
		severity: 'error',
	},
	fare_media_name_non_empty: {
		depends_on: [
			'fare_media_file_required',
		],
		severity: 'warning',
	},
	fare_media_type_valid: {
		depends_on: [
			'fare_media_file_required',
		],
		options: [
			'0',
			'1',
			'2',
			'3',
			'4',
		],
		severity: 'error',
	},
	fare_price_valid_non_negative_decimal: {
		depends_on: [
			'fare_attributes_file_required',
		],
		severity: 'error',
	},
	fare_rule_contains_id_references_zones_stops: {
		depends_on: [
			'fare_rules_file_required',
		],
		severity: 'forbidden',
	},
	fare_rule_destination_id_references_zones_stops: {
		depends_on: [
			'fare_rules_file_required',
		],
		severity: 'forbidden',
	},
	fare_rule_fare_id_references_fare_attributes: {
		depends_on: [
			'fare_rules_file_required',
		],
		severity: 'error',
	},
	fare_rule_origin_id_references_zones_stops: {
		depends_on: [
			'fare_rules_file_required',
		],
		severity: 'forbidden',
	},
	fare_rule_route_id_references_routes: {
		depends_on: [
			'fare_rules_file_required',
		],
		severity: 'error',
	},
	fare_rules_file_required: {
		severity: 'warning',
	},
	feed_contact_email_valid_address: {
		depends_on: [
			'feed_info_file_required',
		],
		severity: 'error',
	},
	feed_contact_url_valid_http_url: {
		depends_on: [
			'feed_info_file_required',
		],
		severity: 'error',
	},
	feed_end_date_valid_yyyymmdd_not_before_start: {
		depends_on: [
			'feed_info_file_required',
		],
		severity: 'error',
	},
	feed_info_file_required: {
		severity: 'error',
	},
	feed_lang_valid_tag: {
		depends_on: [
			'feed_info_file_required',
		],
		options: [
			'pt',
		],
		severity: 'error',
	},
	feed_publisher_name_non_empty: {
		depends_on: [
			'feed_info_file_required',
		],
		severity: 'error',
	},
	feed_publisher_url_valid_http_url: {
		depends_on: [
			'feed_info_file_required',
		],
		severity: 'error',
	},
	feed_remarks: {
		depends_on: [
			'feed_info_file_required',
		],
		severity: 'ignore',
	},
	feed_start_date_valid_yyyymmdd: {
		depends_on: [
			'feed_info_file_required',
		],
		severity: 'error',
	},
	feed_type: {
		depends_on: [
			'feed_info_file_required',
		],
		options: [
			'0',
			'1',
			'2',
		],
		severity: 'error',
	},
	feed_version_valid_identifier: {
		depends_on: [
			'feed_info_file_required',
		],
		severity: 'error',
	},
	field_name: {
		depends_on: [
			'translations_file_required',
		],
		severity: 'ignore',
	},
	field_value: {
		depends_on: [
			'translations_file_required',
		],
		severity: 'ignore',
	},
	frequencies_file_required: {
		severity: 'forbidden',
	},
	frequencies_trip_id_references_trips_table: {
		depends_on: [
			'frequencies_file_required',
		],
		severity: 'error',
	},
	frequency_end_time_valid: {
		depends_on: [
			'frequencies_file_required',
		],
		severity: 'error',
	},
	frequency_start_time_valid: {
		depends_on: [
			'frequencies_file_required',
		],
		severity: 'error',
	},
	friday: {
		depends_on: [
			'calendar_file_required',
		],
		severity: 'error',
	},
	front_display_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	has_bench_valid_enum: {
		depends_on: [
			'stops_file_required',
		],
		options: [
			'0',
			'1',
			'2',
			'3',
		],
		severity: 'ignore',
	},
	has_network_map_valid_enum: {
		depends_on: [
			'stops_file_required',
		],
		options: [
			'0',
			'1',
			'2',
			'3',
		],
		severity: 'ignore',
	},
	has_pip_real_time_valid_enum: {
		depends_on: [
			'stops_file_required',
		],
		options: [
			'0',
			'1',
			'2',
		],
		severity: 'ignore',
	},
	has_schedules_valid_enum: {
		depends_on: [
			'stops_file_required',
		],
		options: [
			'0',
			'1',
			'2',
			'3',
		],
		severity: 'ignore',
	},
	has_shelter_valid_enum: {
		depends_on: [
			'stops_file_required',
		],
		options: [
			'0',
			'1',
			'2',
			'3',
		],
		severity: 'ignore',
	},
	has_stop_sign_valid_enum: {
		depends_on: [
			'stops_file_required',
		],
		options: [
			'0',
			'1',
			'2',
			'3',
		],
		severity: 'ignore',
	},
	has_tariffs_information_valid_enum: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	headway_secs_positive_and_aligns_trip: {
		depends_on: [
			'frequencies_file_required',
		],
		severity: 'error',
	},
	holiday: {
		depends_on: [
			'calendar_dates_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	internal_sound_level_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	is_authority: {
		depends_on: [
			'attributions_file_required',
		],
		severity: 'ignore',
	},
	is_operator: {
		depends_on: [
			'attributions_file_required',
		],
		severity: 'ignore',
	},
	is_producer: {
		depends_on: [
			'attributions_file_required',
		],
		severity: 'ignore',
	},
	kneeling_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
			'2',
		],
		severity: 'error',
	},
	language: {
		depends_on: [
			'translations_file_required',
		],
		severity: 'ignore',
	},
	level_id_unique: {
		depends_on: [
			'levels_file_required',
		],
		severity: 'warning',
	},
	level_id_valid_id: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	level_index_required: {
		depends_on: [
			'levels_file_required',
		],
		severity: 'warning',
	},
	level_name: {
		depends_on: [
			'levels_file_required',
		],
		severity: 'warning',
	},
	levels_file_required: {
		severity: 'ignore',
	},
	license_plate_format_per_market_rules: {
		depends_on: [
			'vehicles_file_required',
		],
		severity: 'ignore',
	},
	line_id_required: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'warning',
	},
	line_long_name_present_when_line_id_present: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'warning',
	},
	line_short_name_present_when_line_id_present: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'warning',
	},
	location_group_id_consistent_with_trip_id_and_stops: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'error',
	},
	location_type_valid_enum: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	lowered_floor_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
			'2',
		],
		severity: 'error',
	},
	min_transfer_time_non_negative_seconds: {
		depends_on: [
			'transfers_file_required',
		],
		severity: 'error',
	},
	monday: {
		depends_on: [
			'calendar_file_required',
		],
		severity: 'error',
	},
	municipality_id_valid: {
		depends_on: [
			'stops_file_required',
		],
		options: [
			'1502',
			'1503',
			'1504',
			'1115',
			'1105',
			'1106',
			'1107',
			'1109',
			'1506',
			'1507',
			'1116',
			'1110',
			'1508',
			'1510',
			'1111',
			'1511',
			'1512',
			'1114',
			'0712',
			'1102',
			'1112',
		],
		severity: 'warning',
	},
	network_id_references_networks_table: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'ignore',
	},
	onboard_monitor_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	one_pattern_id_per_shape_id_group: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	one_shape_id_per_pattern_id_group: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	organization_name: {
		depends_on: [
			'attributions_file_required',
		],
		severity: 'ignore',
	},
	parent_station_id_valid_for_stop_hierarchy: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	parish_id_valid: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'warning',
	},
	passenger_counting_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	path_type_valid_enum: {
		depends_on: [
			'routes_file_required',
		],
		options: [
			'1',
			'2',
			'3',
		],
		severity: 'error',
	},
	pathway_from_stop_id_references_stops_table: {
		depends_on: [
			'pathways_file_required',
		],
		severity: 'warning',
	},
	pathway_id_unique: {
		depends_on: [
			'pathways_file_required',
		],
		severity: 'warning',
	},
	pathway_is_bidirectional_valid_gtfs_enum: {
		depends_on: [
			'pathways_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'warning',
	},
	pathway_length_non_negative: {
		depends_on: [
			'pathways_file_required',
		],
		severity: 'warning',
	},
	pathway_max_slope_allowed_for_pathway_mode: {
		depends_on: [
			'pathways_file_required',
		],
		severity: 'warning',
	},
	pathway_min_width_positive: {
		depends_on: [
			'pathways_file_required',
		],
		severity: 'warning',
	},
	pathway_mode_valid_gtfs_enum: {
		depends_on: [
			'pathways_file_required',
		],
		options: [
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
		],
		severity: 'warning',
	},
	pathway_reversed_signposted_as: {
		depends_on: [
			'pathways_file_required',
		],
		severity: 'warning',
	},
	pathway_signposted_as: {
		depends_on: [
			'pathways_file_required',
		],
		severity: 'warning',
	},
	pathway_stair_count: {
		depends_on: [
			'pathways_file_required',
		],
		severity: 'warning',
	},
	pathway_to_stop_id_references_stops_table: {
		depends_on: [
			'pathways_file_required',
		],
		severity: 'warning',
	},
	pathway_traversal_time_non_negative_seconds: {
		depends_on: [
			'pathways_file_required',
		],
		severity: 'warning',
	},
	pathways_file_required: {
		severity: 'ignore',
	},
	pattern_id_matches_feed_pattern_id_syntax: {
		depends_on: [
			'trips_file_required',
		],
		options: [
			'^[^_]{1,4}_[^_]_[^_]$',
			'^[^_]{1,4}_[^_]_ASC$',
			'^[^_]{1,4}_[^_]_DESC$',
			'^[^_]{1,4}_[^_]_CIRC$',
		],
		severity: 'error',
	},
	pattern_id_present_and_references_consistent: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	pattern_id_single_trip_signature_per_pattern: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	pattern_id_trip_has_required_fields_for_grouping: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	payment_method_valid_gtfs_enum: {
		depends_on: [
			'fare_attributes_file_required',
		],
		options: [
			'0',
		],
		severity: 'error',
	},
	period: {
		depends_on: [
			'calendar_dates_file_required',
		],
		options: [
			'1',
			'2',
			'3',
		],
		severity: 'error',
	},
	pickup_booking_rule_id_references_booking_rules: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'ignore',
	},
	pickup_type_valid_gtfs_enum: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'error',
	},
	platform_code_valid: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	propulsion_type_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
		],
		severity: 'error',
	},
	public_visible_valid_enum: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	ramp_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
			'2',
			'3',
		],
		severity: 'error',
	},
	rear_display_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
			'2',
		],
		severity: 'error',
	},
	record_id: {
		depends_on: [
			'translations_file_required',
		],
		severity: 'ignore',
	},
	record_sub_id: {
		depends_on: [
			'translations_file_required',
		],
		severity: 'ignore',
	},
	region_id_valid: {
		depends_on: [
			'stops_file_required',
		],
		options: [
			'PT170',
			'P185',
			'PT16B',
			'PT111',
			'PT112',
			'PT119',
			'PT11A',
			'PT11B',
			'PT11C',
			'PT11D',
			'PT11E',
			'PT150',
			'PT1191',
			'PT1192',
			'PT1193',
			'PT1194',
			'PT1195',
			'PT1196',
			'PT1A0',
			'PT1B0',
			'PT1C1',
			'PT1C2',
			'PT1C3',
			'PT1C4',
			'PT1D1',
			'PT1D2',
			'PT1D3',
		],
		severity: 'warning',
	},
	registration_date_valid_day_granularity: {
		depends_on: [
			'vehicles_file_required',
		],
		severity: 'error',
	},
	rider_categories_file_required: {
		severity: 'ignore',
	},
	rider_category_id_unique: {
		depends_on: [
			'rider_categories_file_required',
		],
		severity: 'ignore',
	},
	rider_category_name_non_empty: {
		depends_on: [
			'rider_categories_file_required',
		],
		severity: 'ignore',
	},
	route_agency_id_references_agency_table: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'error',
	},
	route_color_valid_hex_string: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'error',
	},
	route_desc_per_severity_and_content_rules: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'ignore',
	},
	route_id: {
		depends_on: [
			'attributions_file_required',
		],
		severity: 'ignore',
	},
	route_id_consistent_for_all_patterns_in_trips: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	route_id_references_routes_table: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	route_id_unique: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'error',
	},
	route_long_name_or_short_name_present: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'error',
	},
	route_remarks: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'ignore',
	},
	route_short_name_or_long_name_present: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'error',
	},
	route_sort_order_non_negative_integer: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'ignore',
	},
	route_text_color_valid_hex_contrast: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'error',
	},
	route_type_valid_gtfs_enum: {
		depends_on: [
			'routes_file_required',
		],
		options: [
			'0',
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'11',
			'12',
		],
		severity: 'error',
	},
	route_url_valid_http_url: {
		depends_on: [
			'routes_file_required',
		],
		severity: 'ignore',
	},
	routes_file_required: {
		severity: 'error',
	},
	saturday: {
		depends_on: [
			'calendar_file_required',
		],
		severity: 'error',
	},
	school: {
		depends_on: [
			'routes_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'warning',
	},
	service_id_references_calendar_service: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	shape_block_distance_rows_aggregated: {
		depends_on: [
			'shapes_file_required',
		],
		options: [
			'100.0',
		],
		severity: 'error',
	},
	shape_dist_traveled_delta_mismatches_haversine_block: {
		depends_on: [
			'shapes_file_required',
		],
		options: [
			'200.0',
		],
		severity: 'error',
	},
	shape_dist_traveled_delta_mismatches_haversine_segment: {
		depends_on: [
			'shapes_file_required',
		],
		options: [
			'100.0',
		],
		severity: 'error',
	},
	shape_dist_traveled_non_decreasing_with_sequence: {
		depends_on: [
			'shapes_file_required',
		],
		severity: 'error',
	},
	shape_dist_traveled_non_negative_monotonic: {
		depends_on: [
			'shapes_file_required',
		],
		severity: 'error',
	},
	shape_id_and_point_sequence_required: {
		depends_on: [
			'shapes_file_required',
		],
		severity: 'error',
	},
	shape_id_needs_to_be_the_same_as_pattern_id: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'warning',
	},
	shape_id_references_shapes_table_when_present: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	shape_id_required: {
		depends_on: [
			'shapes_file_required',
		],
		severity: 'error',
	},
	shape_pt_lat_valid_latitude: {
		depends_on: [
			'shapes_file_required',
		],
		severity: 'error',
	},
	shape_pt_lon_valid_longitude: {
		depends_on: [
			'shapes_file_required',
		],
		severity: 'error',
	},
	shape_pt_sequence_not_repeated_within_shape: {
		depends_on: [
			'shapes_file_required',
		],
		severity: 'error',
	},
	shape_pt_sequence_strictly_increasing: {
		depends_on: [
			'shapes_file_required',
		],
		severity: 'error',
	},
	shape_sequence_position_mismatches_cumulative_traveled_distance: {
		depends_on: [
			'shapes_file_required',
		],
		options: [
			'1000.0',
		],
		severity: 'warning',
	},
	shapes_file_required: {
		severity: 'error',
	},
	shelter_code_valid: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	shelter_maintainer_valid: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	side_display_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
			'2',
		],
		severity: 'error',
	},
	start_pickup_drop_off_window_valid: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'ignore',
	},
	static_information_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	stop_access: {
		depends_on: [
			'stops_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'ignore',
	},
	stop_code_valid: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'error',
	},
	stop_desc_valid: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	stop_headsign_present: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'forbidden',
	},
	stop_id_unique: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'error',
	},
	stop_lat_valid_latitude_range: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'error',
	},
	stop_lon_valid_longitude_range: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'error',
	},
	stop_name_required_by_location_type: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'error',
	},
	stop_sequence_increasing_by_one_along_trip: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	stop_short_name_valid: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	stop_times_continuous_drop_off_valid_gtfs_enum: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'warning',
	},
	stop_times_continuous_pickup_valid_gtfs_enum: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'warning',
	},
	stop_times_file_required: {
		severity: 'error',
	},
	stop_times_shape_dist_traveled_non_decreasing_on_trip: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'error',
	},
	stop_times_stop_id_references_stops_table: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'error',
	},
	stop_times_trip_id_references_trips_table: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'error',
	},
	stop_timezone_valid: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	stop_url_valid_url: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	stops_file_required: {
		severity: 'error',
	},
	sunday: {
		depends_on: [
			'calendar_file_required',
		],
		severity: 'error',
	},
	table_name: {
		depends_on: [
			'translations_file_required',
		],
		severity: 'ignore',
	},
	thursday: {
		depends_on: [
			'calendar_file_required',
		],
		severity: 'error',
	},
	timepoint_valid_gtfs_enum: {
		depends_on: [
			'stop_times_file_required',
		],
		severity: 'warning',
	},
	transfer_duration_valid_seconds_range: {
		depends_on: [
			'fare_attributes_file_required',
		],
		severity: 'ignore',
	},
	transfer_from_stop_id_references_stops_table: {
		depends_on: [
			'transfers_file_required',
		],
		severity: 'error',
	},
	transfer_to_stop_id_references_stops_table: {
		depends_on: [
			'transfers_file_required',
		],
		severity: 'error',
	},
	transfer_type_valid_gtfs_enum: {
		depends_on: [
			'transfers_file_required',
		],
		options: [
			'0',
			'1',
			'2',
			'3',
			'4',
			'5',
		],
		severity: 'error',
	},
	transfers_file_required: {
		severity: 'ignore',
	},
	transfers_valid_gtfs_enum: {
		depends_on: [
			'fare_attributes_file_required',
		],
		options: [
			'0',
		],
		severity: 'warning',
	},
	translation: {
		depends_on: [
			'translations_file_required',
		],
		severity: 'ignore',
	},
	translations_file_required: {
		severity: 'ignore',
	},
	trip_headsign_consistent_for_all_patterns_in_trips: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	trip_headsign_present_when_short_name_absent: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	trip_id: {
		depends_on: [
			'attributions_file_required',
		],
		severity: 'ignore',
	},
	trip_id_limit_max_length: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	trip_id_unique: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	trip_path_stop_coordinates_referenced_from_stops: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'error',
	},
	trip_short_name_exclusivity: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'ignore',
	},
	trips_file_required: {
		severity: 'error',
	},
	tts_stop_name_valid: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
	tuesday: {
		depends_on: [
			'calendar_file_required',
		],
		severity: 'error',
	},
	typology_in_allowed_vehicle_types: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0.1',
			'0.2',
			'0.3',
			'1.1',
			'1.2',
			'1.3',
			'2.1',
			'2.2',
			'2.3',
			'3.1',
			'3.2',
			'3.3',
			'3.4',
			'3.5',
			'3.6',
			'3.7',
			'4.1',
			'4.2',
			'4.3',
			'7.1',
			'7.2',
			'7.3',
		],
		severity: 'warning',
	},
	vehicle_agency_id_references_agency_table: {
		depends_on: [
			'vehicles_file_required',
		],
		severity: 'warning',
	},
	vehicle_id_unique: {
		depends_on: [
			'vehicles_file_required',
		],
		severity: 'error',
	},
	vehicle_make_required: {
		depends_on: [
			'vehicles_file_required',
		],
		severity: 'error',
	},
	vehicle_model_required: {
		depends_on: [
			'vehicles_file_required',
		],
		severity: 'error',
	},
	vehicle_owner_required: {
		depends_on: [
			'vehicles_file_required',
		],
		severity: 'error',
	},
	vehicles_file_required: {
		severity: 'warning',
	},
	video_surveillance_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'warning',
	},
	wednesday: {
		depends_on: [
			'calendar_file_required',
		],
		severity: 'error',
	},
	wheelchair_accessible_valid_gtfs_enum: {
		depends_on: [
			'trips_file_required',
		],
		severity: 'warning',
	},
	wheelchair_boarding_valid_enum: {
		depends_on: [
			'stops_file_required',
		],
		options: [
			'0',
			'1',
			'2',
		],
		severity: 'warning',
	},
	wheelchair_spots_valid_enum: {
		depends_on: [
			'vehicles_file_required',
		],
		options: [
			'0',
			'1',
		],
		severity: 'error',
	},
	zone_id_valid: {
		depends_on: [
			'stops_file_required',
		],
		severity: 'ignore',
	},
} satisfies GtfsValidationRule;

export type GtfsValidationRuleId = keyof typeof gtfsValidationRulesConfig;
