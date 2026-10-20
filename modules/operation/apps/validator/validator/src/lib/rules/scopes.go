package rules

// executionScopes describe grouped validators whose prerequisites must run in
// the same scope. This is execution metadata, not a configuration allowlist.
var executionScopes = map[string]string{
	"trips_pattern_id_trip_has_required_fields_for_grouping":            "pattern",
	"trips_pattern_id_single_trip_signature_per_pattern":                "pattern",
	"trips_route_id_consistent_for_all_patterns_in_trips":               "pattern",
	"trips_direction_id_consistent_for_all_patterns_in_trips":           "pattern",
	"trips_one_shape_id_per_pattern_id_group":                           "pattern",
	"trips_one_pattern_id_per_shape_id_group":                           "shape",
	"trip_headsign_consistent_for_all_patterns_in_trips":                "pattern",
	"trips_shape_id_max_two_per_route":                                  "route",
	"trip_headsign_max_two_per_route":                                   "route",
	"trips_shape_id_consistent_per_route_direction":                     "route",
	"trip_headsign_consistent_per_route_direction":                      "route",
	"stop_times_arrival_departure_time_non_decreasing_by_stop_sequence": "trip",
	"shape_id_and_point_sequence_required":                              "shape",
	"shape_pt_sequence_strictly_increasing":                             "shape",
	"shape_dist_traveled_non_decreasing_with_sequence":                  "shape",
	"shapes_shape_point_spacing_valid":                                  "shape",
	"shapes_shape_dist_traveled_segment_valid":                          "shape",
	"shapes_shape_dist_traveled_block_valid":                            "shape",
}
