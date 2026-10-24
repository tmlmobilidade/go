# Validation rule names

Use `<table>_<field>_field` for presence, `_valid` for values, `_foreign`
for references, and `_unique` for uniqueness. Custom rules use a short
description of the check. Agency retains its established `agency_*` names.

The following IDs were renamed without changing validation behavior. Update
saved rule configurations and `depends_on` entries using this mapping. Old
IDs are not aliases for the new names. Repository references and translations
have been updated; persisted configurations outside the repository are not
modified by this change.

| Previous ID | New ID |
| --- | --- |
| `fare_attributes_agency_id_references_agency_table` | `fare_attributes_agency_id_foreign` |
| `fare_attributes_id_unique` | `fare_attributes_fare_id_unique` |
| `fare_attributes_payment_method_valid_gtfs_enum` | `fare_attributes_payment_method_valid` |
| `fare_attributes_transfer_duration_valid_seconds_range` | `fare_attributes_transfer_duration_valid` |
| `fare_attributes_transfers_valid_gtfs_enum` | `fare_attributes_transfers_valid` |
| `fare_price_valid_non_negative_decimal` | `fare_attributes_price_valid` |
| `fare_rule_contains_id_references_zones_stops` | `fare_rules_contains_id_foreign` |
| `fare_rule_destination_id_references_zones_stops` | `fare_rules_destination_id_foreign` |
| `fare_rule_fare_id_references_fare_attributes` | `fare_rules_fare_id_foreign` |
| `fare_rule_origin_id_references_zones_stops` | `fare_rules_origin_id_foreign` |
| `fare_rule_route_id_references_routes` | `fare_rules_route_id_foreign` |
| `frequencies_exact_times_zero_when_timed_trip_uses_frequencies` | `frequencies_exact_times_valid` |
| `frequencies_headway_secs_positive_and_aligns_trip` | `frequencies_headway_secs_valid` |
| `frequencies_trip_id_references_trips_table` | `frequencies_trip_id_foreign` |
| `frequency_end_time_valid` | `frequencies_end_time_valid` |
| `frequency_start_time_valid` | `frequencies_start_time_valid` |
| `level_id_unique` | `levels_level_id_unique` |
| `level_index_required` | `levels_level_index_valid` |
| `pathway_from_stop_id_references_stops_table` | `pathways_from_stop_id_foreign` |
| `pathway_id_unique` | `pathways_pathway_id_unique` |
| `pathway_is_bidirectional_valid_gtfs_enum` | `pathways_is_bidirectional_valid` |
| `pathway_length_non_negative` | `pathways_length_valid` |
| `pathway_max_slope_allowed_for_pathway_mode` | `pathways_max_slope_valid` |
| `pathway_min_width_positive` | `pathways_min_width_valid` |
| `pathway_mode_valid_gtfs_enum` | `pathways_pathway_mode_valid` |
| `pathway_stair_count` | `pathways_stair_count_valid` |
| `pathway_to_stop_id_references_stops_table` | `pathways_to_stop_id_foreign` |
| `pathway_traversal_time_non_negative_seconds` | `pathways_traversal_time_valid` |
| `rider_categories_at_most_one_default_fare_category` | `rider_categories_is_default_fare_category_valid` |
| `rider_categories_eligibility_url_valid_http_url` | `rider_categories_eligibility_url_valid` |
| `rider_category_id_unique` | `rider_categories_rider_category_id_unique` |
| `routes_agency_id_unique` | `routes_agency_id_foreign` |
| `routes_continuous_drop_off_valid_gtfs_enum` | `routes_continuous_drop_off_valid` |
| `routes_continuous_pickup_valid_gtfs_enum` | `routes_continuous_pickup_valid` |
| `routes_route_url_different_agency_url` | `routes_route_url_different_from_agency_url` |
| `stop_times_arrival_departure_time_non_decreasing_by_stop_sequence` | `stop_times_arrival_departure_time_sequence` |
| `transfer_from_route_id_references_routes_table` | `transfers_from_route_id_foreign` |
| `transfer_from_stop_id_references_stops_table` | `transfers_from_stop_id_foreign` |
| `transfer_from_trip_id_references_trips_table` | `transfers_from_trip_id_foreign` |
| `transfer_to_route_id_references_routes_table` | `transfers_to_route_id_foreign` |
| `transfer_to_stop_id_references_stops_table` | `transfers_to_stop_id_foreign` |
| `transfer_to_trip_id_references_trips_table` | `transfers_to_trip_id_foreign` |
| `transfer_type_valid_gtfs_enum` | `transfers_transfer_type_valid` |
| `transfers_min_transfer_time_non_negative_seconds` | `transfers_min_transfer_time_valid` |
| `trip_headsign_consistent_for_all_patterns_in_trips` | `trips_trip_headsign_pattern_consistent` |
| `trip_headsign_consistent_per_route_direction` | `trips_trip_headsign_route_direction_consistent` |
| `trip_headsign_max_two_per_route` | `trips_trip_headsign_max_two_per_route` |
| `trip_id_limit_max_length` | `trips_trip_id_max_length` |
| `trip_id_unique` | `trips_trip_id_unique` |
| `trip_path_stop_coordinates_referenced_from_stops` | `trips_stop_coordinates` |
| `trips_bikes_allowed_valid_gtfs_enum` | `trips_bikes_allowed_valid` |
| `trips_direction_id_consistent_for_all_patterns_in_trips` | `trips_direction_id_pattern_consistent` |
| `trips_direction_id_matches_feed_pattern_direction` | `trips_direction_pattern_id_match` |
| `trips_direction_id_valid_enum` | `trips_direction_id_valid` |
| `trips_one_pattern_id_per_shape_id_group` | `trips_one_pattern_per_shape` |
| `trips_one_shape_id_per_pattern_id_group` | `trips_one_shape_per_pattern` |
| `trips_pattern_id_matches_feed_pattern_id_syntax` | `trips_pattern_id_format` |
| `trips_pattern_id_needs_to_be_the_same_as_shape_id` | `trips_pattern_id_same_shape_id` |
| `trips_pattern_id_single_trip_signature_per_pattern` | `trips_pattern_single_signature` |
| `trips_pattern_id_trip_has_required_fields_for_grouping` | `trips_pattern_required_fields` |
| `trips_route_id_consistent_for_all_patterns_in_trips` | `trips_route_id_pattern_consistent` |
| `trips_route_id_references_routes_table` | `trips_route_id_foreign` |
| `trips_service_id_references_calendar_service` | `trips_service_id_foreign` |
| `trips_shape_id_consistent_per_route_direction` | `trips_shape_id_route_direction_consistent` |
| `trips_shape_id_matches_route_id_and_direction_id` | `trips_shape_id_route_direction_match` |
| `trips_shape_id_references_shapes_table_when_present` | `trips_shape_id_foreign` |
| `trips_stop_sequence_increasing_by_one_along_trip` | `trips_stop_sequence` |
| `trips_wheelchair_accessible_valid_gtfs_enum` | `trips_wheelchair_accessible_valid` |
| `vehicle_id_unique` | `vehicles_vehicle_id_unique` |
| `vehicles_bicycles_rack_count_non_negative` | `vehicles_bicycles_capacity_valid` |
| `vehicles_car_capacity_non_negative` | `vehicles_car_capacity_valid` |
| `vehicles_emission_valid_enum` | `vehicles_emission_valid` |
| `vehicles_license_plate_format_per_market_rules` | `vehicles_license_plate_valid` |
| `vehicles_propulsion_valid_enum` | `vehicles_propulsion_valid` |
| `vehicles_registration_date_valid_day_granularity` | `vehicles_registration_date_valid` |
| `vehicles_total_capacity_non_negative` | `vehicles_total_capacity_valid` |
| `vehicles_vehicle_type_valid_enum` | `vehicles_vehicle_type_valid` |
| `vehicles_wheelchair_accessible_valid_gtfs_enum` | `vehicles_wheelchair_accessible_valid` |
