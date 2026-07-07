import { type GtfsRulesTypes } from '@/gtfs-rules/rule-types.js';

export const gtfsrules: GtfsRulesTypes = {
	agency: {
		_file: 'error',
		agency_email_valid_address: {
			severity: 'warning',
		},
		agency_fare_url_valid_url: {
			severity: 'warning',
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
			severity: 'error',
		},
		agency_id_unique: {
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
			severity: 'ignore',
		},
		agency_name_present: {
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
			severity: 'error',
		},
		agency_timezone_valid_id: {
			severity: 'error',
		},
		agency_url_valid_url: {
			severity: 'error',
		},
	},
	attributions: {
		_file: 'ignore',
		agency_id: {
			severity: 'ignore',
		},
		attribution_email: {
			severity: 'ignore',
		},
		attribution_id: {
			severity: 'ignore',
		},
		attribution_phone: {
			severity: 'ignore',
		},
		attribution_url: {
			severity: 'ignore',
		},
		is_authority: {
			severity: 'ignore',
		},
		is_operator: {
			severity: 'ignore',
		},
		is_producer: {
			severity: 'ignore',
		},
		organization_name: {
			severity: 'ignore',
		},
		route_id: {
			severity: 'ignore',
		},
		trip_id: {
			severity: 'ignore',
		},
	},
	calendar: {
		_file: 'ignore',
		calendar_end_date_valid_yyyymmdd: {
			severity: 'error',
		},
		calendar_service_id_unique_non_empty: {
			severity: 'error',
		},
		calendar_start_date_valid_yyyymmdd: {
			severity: 'error',
		},
		friday: {
			severity: 'error',
		},
		monday: {
			severity: 'error',
		},
		saturday: {
			severity: 'error',
		},
		sunday: {
			severity: 'error',
		},
		thursday: {
			severity: 'error',
		},
		tuesday: {
			severity: 'error',
		},
		wednesday: {
			severity: 'error',
		},
	},
	calendar_dates: {
		_file: 'ignore',
		calendar_dates_service_id_references_calendar: {
			severity: 'error',
		},
		day_type: {
			options: [
				'1',
				'2',
				'3',
			],
			severity: 'error',
		},
		exception_date_valid_yyyymmdd: {
			severity: 'error',
		},
		exception_type_add_or_remove_service: {
			severity: 'error',
		},
		holiday: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
		period: {
			options: [
				'1',
				'2',
				'3',
			],
			severity: 'error',
		},
	},
	fare_attributes: {
		_file: 'warning',
		currency_type_valid: {
			options: [
				'EUR',
			],
			severity: 'error',
		},
		fare_attributes_agency_id_references_agency_table: {
			severity: 'error',
		},
		fare_id_unique: {
			severity: 'error',
		},
		fare_price_valid_non_negative_decimal: {
			severity: 'error',
		},
		payment_method_valid_gtfs_enum: {
			options: [
				'0',
			],
			severity: 'error',
		},
		transfer_duration_valid_seconds_range: {
			severity: 'ignore',
		},
		transfers_valid_gtfs_enum: {
			options: [
				'0',
			],
			severity: 'warning',
		},
	},
	fare_media: {
		_file: 'ignore',
		fare_media_id_unique: {
			severity: 'error',
		},
		fare_media_name_non_empty: {
			severity: 'warning',
		},
		fare_media_type_valid: {
			options: [
				'0',
				'1',
				'2',
				'3',
				'4',
			],
			severity: 'error',
		},
	},
	fare_rules: {
		_file: 'warning',
		fare_rule_contains_id_references_zones_stops: {
			severity: 'forbidden',
		},
		fare_rule_destination_id_references_zones_stops: {
			severity: 'forbidden',
		},
		fare_rule_fare_id_references_fare_attributes: {
			severity: 'error',
		},
		fare_rule_origin_id_references_zones_stops: {
			severity: 'forbidden',
		},
		fare_rule_route_id_references_routes: {
			severity: 'error',
		},
	},
	feed_info: {
		_file: 'error',
		default_lang_matches_feed_lang_when_present: {
			severity: 'error',
		},
		feed_contact_email_valid_address: {
			severity: 'error',
		},
		feed_contact_url_valid_http_url: {
			severity: 'error',
		},
		feed_end_date_valid_yyyymmdd_not_before_start: {
			severity: 'error',
		},
		feed_lang_valid_tag: {
			options: [
				'pt',
			],
			severity: 'error',
		},
		feed_publisher_name_non_empty: {
			severity: 'error',
		},
		feed_publisher_url_valid_http_url: {
			severity: 'error',
		},
		feed_remarks: {
			severity: 'ignore',
		},
		feed_start_date_valid_yyyymmdd: {
			severity: 'error',
		},
		feed_type: {
			options: [
				'0',
				'1',
				'2',
			],
			severity: 'error',
		},
		feed_version_valid_identifier: {
			severity: 'error',
		},
	},
	file_validation: {
		_file: 'ignore',
		gtfs_feed_file_presence_and_integrity_rule: {
			severity: 'ignore',
		},
	},
	frequencies: {
		_file: 'forbidden',
		exact_times_zero_when_timed_trip_uses_frequencies: {
			severity: 'error',
		},
		frequencies_trip_id_references_trips_table: {
			severity: 'error',
		},
		frequency_end_time_valid: {
			severity: 'error',
		},
		frequency_start_time_valid: {
			severity: 'error',
		},
		headway_secs_positive_and_aligns_trip: {
			severity: 'error',
		},
	},
	levels: {
		_file: 'ignore',
		level_id: {
			severity: 'ignore',
		},
		level_index: {
			severity: 'ignore',
		},
		level_name: {
			severity: 'ignore',
		},
	},
	pathways: {
		_file: 'ignore',
		from_stop_id: {
			severity: 'ignore',
		},
		is_bidirectional: {
			severity: 'ignore',
		},
		length: {
			severity: 'ignore',
		},
		max_slope: {
			severity: 'ignore',
		},
		min_width: {
			severity: 'ignore',
		},
		pathway_id: {
			severity: 'ignore',
		},
		pathway_mode: {
			severity: 'ignore',
		},
		reversed_signposted_as: {
			severity: 'ignore',
		},
		signposted_as: {
			severity: 'ignore',
		},
		stair_count: {
			severity: 'ignore',
		},
		to_stop_id: {
			severity: 'ignore',
		},
		traversal_time: {
			severity: 'ignore',
		},
	},
	rider_categories: {
		_file: 'ignore',
		at_most_one_default_fare_category: {
			severity: 'ignore',
		},
		eligibility_url_valid_http_url: {
			severity: 'ignore',
		},
		rider_category_id_unique: {
			severity: 'ignore',
		},
		rider_category_name_non_empty: {
			severity: 'ignore',
		},
	},
	routes: {
		_file: 'error',
		circular: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
		continuous_drop_off_valid_gtfs_enum: {
			options: [
				'0',
				'1',
			],
			severity: 'warning',
		},
		continuous_pickup_valid_gtfs_enum: {
			options: [
				'0',
				'1',
			],
			severity: 'warning',
		},
		line_id: {
			severity: 'error',
		},
		line_long_name: {
			severity: 'error',
		},
		line_short_name: {
			severity: 'error',
		},
		network_id_references_networks_table: {
			severity: 'ignore',
		},
		path_type_valid_enum: {
			options: [
				'1',
				'2',
				'3',
			],
			severity: 'error',
		},
		route_agency_id_references_agency_table: {
			severity: 'error',
		},
		route_color_valid_hex_string: {
			severity: 'error',
		},
		route_desc_per_severity_and_content_rules: {
			severity: 'ignore',
		},
		route_id_unique: {
			severity: 'error',
		},
		route_long_name_or_short_name_present: {
			severity: 'error',
		},
		route_remarks: {
			severity: 'ignore',
		},
		route_short_name_or_long_name_present: {
			severity: 'error',
		},
		route_sort_order_non_negative_integer: {
			severity: 'ignore',
		},
		route_text_color_valid_hex_contrast: {
			severity: 'error',
		},
		route_type_valid_gtfs_enum: {
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
			severity: 'ignore',
		},
		school: {
			options: [
				'0',
				'1',
			],
			severity: 'warning',
		},
	},
	shapes: {
		_file: 'error',
		shape_block_distance_rows_aggregated: {
			options: [
				'100.0',
			],
			severity: 'error',
		},
		shape_dist_traveled_delta_mismatches_haversine_block: {
			options: [
				'200.0',
			],
			severity: 'error',
		},
		shape_dist_traveled_delta_mismatches_haversine_segment: {
			options: [
				'100.0',
			],
			severity: 'error',
		},
		shape_dist_traveled_non_decreasing_with_sequence: {
			severity: 'error',
		},
		shape_dist_traveled_non_negative_monotonic: {
			severity: 'error',
		},
		shape_id_and_point_sequence_required: {
			severity: 'error',
		},
		shape_id_required: {
			severity: 'error',
		},
		shape_pt_lat_valid_latitude: {
			severity: 'error',
		},
		shape_pt_lon_valid_longitude: {
			severity: 'error',
		},
		shape_pt_sequence_not_repeated_within_shape: {
			severity: 'error',
		},
		shape_pt_sequence_strictly_increasing: {
			severity: 'error',
		},
		shape_sequence_position_mismatches_cumulative_traveled_distance: {
			severity: 'error',
		},
	},
	stop_times: {
		_file: 'error',
		arrival_time_ordering_with_departure_and_frequencies: {
			severity: 'error',
		},
		departure_time_ordering_with_arrival_and_timepoint: {
			severity: 'error',
		},
		drop_off_booking_rule_id_references_booking_rules_or_empty: {
			severity: 'ignore',
		},
		drop_off_type_valid_gtfs_enum: {
			severity: 'error',
		},
		end_pickup_drop_off_window_valid: {
			severity: 'ignore',
		},
		location_group_id_consistent_with_trip_id_and_stops: {
			severity: 'error',
		},
		pickup_booking_rule_id_references_booking_rules: {
			severity: 'ignore',
		},
		pickup_type_valid_gtfs_enum: {
			severity: 'error',
		},
		start_pickup_drop_off_window_valid: {
			severity: 'ignore',
		},
		stop_headsign_present: {
			severity: 'forbidden',
		},
		stop_times_continuous_drop_off_valid_gtfs_enum: {
			severity: 'warning',
		},
		stop_times_continuous_pickup_valid_gtfs_enum: {
			severity: 'warning',
		},
		stop_times_shape_dist_traveled_non_decreasing_on_trip: {
			severity: 'error',
		},
		stop_times_stop_id_references_stops_table: {
			severity: 'error',
		},
		stop_times_trip_id_references_trips_table: {
			severity: 'error',
		},
		timepoint_valid_gtfs_enum: {
			severity: 'warning',
		},
	},
	stops: {
		_file: 'error',
		has_bench_valid_enum: {
			options: [
				'0',
				'1',
				'2',
				'3',
			],
			severity: 'ignore',
		},
		has_network_map_valid_enum: {
			options: [
				'0',
				'1',
				'2',
				'3',
			],
			severity: 'ignore',
		},
		has_pip_real_time_valid_enum: {
			options: [
				'0',
				'1',
				'2',
			],
			severity: 'ignore',
		},
		has_schedules_valid_enum: {
			options: [
				'0',
				'1',
				'2',
				'3',
			],
			severity: 'ignore',
		},
		has_shelter_valid_enum: {
			options: [
				'0',
				'1',
				'2',
				'3',
			],
			severity: 'ignore',
		},
		has_stop_sign_valid_enum: {
			options: [
				'0',
				'1',
				'2',
				'3',
			],
			severity: 'ignore',
		},
		has_tariffs_information_valid_enum: {
			severity: 'ignore',
		},
		level_id_valid_id: {
			severity: 'ignore',
		},
		location_type_valid_enum: {
			severity: 'ignore',
		},
		municipality_id_valid: {
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
		parent_station_id_valid_for_stop_hierarchy: {
			severity: 'ignore',
		},
		parish_id_valid: {
			severity: 'warning',
		},
		platform_code_valid: {
			severity: 'ignore',
		},
		public_visible_valid_enum: {
			severity: 'ignore',
		},
		region_id_valid: {
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
		shelter_code_valid: {
			severity: 'ignore',
		},
		shelter_maintainer_valid: {
			severity: 'ignore',
		},
		stop_code_valid: {
			severity: 'error',
		},
		stop_desc_valid: {
			severity: 'ignore',
		},
		stop_id_unique: {
			severity: 'error',
		},
		stop_lat_valid_latitude_range: {
			severity: 'error',
		},
		stop_lon_valid_longitude_range: {
			severity: 'error',
		},
		stop_name_required_by_location_type: {
			severity: 'error',
		},
		stop_short_name_valid: {
			severity: 'ignore',
		},
		stop_timezone_valid: {
			severity: 'ignore',
		},
		stop_url_valid_url: {
			severity: 'ignore',
		},
		tts_stop_name_valid: {
			severity: 'ignore',
		},
		wheelchair_boarding_valid_enum: {
			options: [
				'0',
				'1',
				'2',
			],
			severity: 'warning',
		},
		zone_id_valid: {
			severity: 'ignore',
		},
	},
	transfers: {
		_file: 'ignore',
		from_stop_id: {
			severity: 'ignore',
		},
		min_transfer_time: {
			severity: 'ignore',
		},
		to_stop_id: {
			severity: 'ignore',
		},
		transfer_type: {
			severity: 'ignore',
		},
	},
	translations: {
		_file: 'ignore',
		field_name: {
			severity: 'ignore',
		},
		field_value: {
			severity: 'ignore',
		},
		language: {
			severity: 'ignore',
		},
		record_id: {
			severity: 'ignore',
		},
		record_sub_id: {
			severity: 'ignore',
		},
		table_name: {
			severity: 'ignore',
		},
		translation: {
			severity: 'ignore',
		},
	},
	trips: {
		_file: 'error',
		bikes_allowed_valid_gtfs_enum: {
			severity: 'warning',
		},
		block_id_in_allowed_set: {
			severity: 'ignore',
		},
		direction_id_consistent_for_all_patterns_in_trips: {
			severity: 'error',
		},
		direction_id_matches_feed_pattern_direction: {
			severity: 'ignore',
		},
		direction_id_valid_enum: {
			severity: 'error',
		},
		one_pattern_id_per_shape_id_group: {
			severity: 'error',
		},
		one_shape_id_per_pattern_id_group: {
			severity: 'error',
		},
		pattern_id_matches_feed_pattern_id_syntax: {
			options: [
				'^[^_]{1,4}_[^_]_[^_]$',
				'^[^_]{1,4}_[^_]_ASC$',
				'^[^_]{1,4}_[^_]_DESC$',
				'^[^_]{1,4}_[^_]_CIRC$',
			],
			severity: 'error',
		},
		pattern_id_present_and_references_consistent: {
			severity: 'error',
		},
		pattern_id_single_trip_signature_per_pattern: {
			severity: 'error',
		},
		pattern_id_trip_has_required_fields_for_grouping: {
			severity: 'error',
		},
		route_id_consistent_for_all_patterns_in_trips: {
			severity: 'error',
		},
		route_id_references_routes_table: {
			severity: 'error',
		},
		service_id_references_calendar_service: {
			severity: 'error',
		},
		shape_id_needs_to_be_the_same_as_pattern_id: {
			severity: 'warning',
		},
		shape_id_references_shapes_table_when_present: {
			severity: 'error',
		},
		stop_sequence_increasing_by_one_along_trip: {
			severity: 'error',
		},
		trip_headsign_consistent_for_all_patterns_in_trips: {
			severity: 'error',
		},
		trip_headsign_present_when_short_name_absent: {
			severity: 'error',
		},
		trip_id_limit_max_length: {
			severity: 'error',
		},
		trip_id_unique: {
			severity: 'error',
		},
		trip_path_stop_coordinates_referenced_from_stops: {
			severity: 'error',
		},
		trip_short_name_exclusivity: {
			severity: 'ignore',
		},
		wheelchair_accessible_valid_gtfs_enum: {
			severity: 'warning',
		},
	},
	vehicles: {
		_file: 'warning',
		available_seats_non_negative: {
			severity: 'error',
		},
		available_standing_non_negative: {
			severity: 'error',
		},
		bicycles_rack_count_non_negative: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
		climatization_valid_enum: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
		consumption_meter_valid_format: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
		emission_code_valid_for_propulsion_type: {
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
		external_sound_valid_enum: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
		front_display_valid_enum: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
		internal_sound_level_valid_enum: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
		kneeling_valid_enum: {
			options: [
				'0',
				'1',
				'2',
			],
			severity: 'error',
		},
		license_plate_format_per_market_rules: {
			severity: 'ignore',
		},
		lowered_floor_valid_enum: {
			options: [
				'0',
				'1',
				'2',
			],
			severity: 'error',
		},
		onboard_monitor_valid_enum: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
		passenger_counting_valid_enum: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
		propulsion_type_valid_enum: {
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
		ramp_valid_enum: {
			options: [
				'0',
				'1',
				'2',
				'3',
			],
			severity: 'error',
		},
		rear_display_valid_enum: {
			options: [
				'0',
				'1',
				'2',
			],
			severity: 'error',
		},
		registration_date_valid_day_granularity: {
			severity: 'error',
		},
		side_display_valid_enum: {
			options: [
				'0',
				'1',
				'2',
			],
			severity: 'error',
		},
		static_information_valid_enum: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
		typology_in_allowed_vehicle_types: {
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
			severity: 'warning',
		},
		vehicle_id_unique: {
			severity: 'error',
		},
		vehicle_make_required: {
			severity: 'error',
		},
		vehicle_model_required: {
			severity: 'error',
		},
		vehicle_owner_required: {
			severity: 'error',
		},
		video_surveillance_valid_enum: {
			options: [
				'0',
				'1',
			],
			severity: 'warning',
		},
		wheelchair_spots_valid_enum: {
			options: [
				'0',
				'1',
			],
			severity: 'error',
		},
	},
};
