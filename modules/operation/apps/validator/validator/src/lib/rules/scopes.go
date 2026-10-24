package rules

// ExecutionScope returns the group a rule checks, or "" for a row check.
func ExecutionScope(id string) string {
	return executionScopes[id]
}

// executionScopes describe grouped validators whose prerequisites must run in
// the same scope. This is execution metadata, not a configuration allowlist.
var executionScopes = map[string]string{
	"trips_pattern_required_fields":                    "pattern",
	"trips_pattern_single_signature":                   "pattern",
	"trips_route_id_pattern_consistent":                "pattern",
	"trips_direction_id_pattern_consistent":            "pattern",
	"trips_one_shape_per_pattern":                      "pattern",
	"trips_one_pattern_per_shape":                      "shape",
	"trips_trip_headsign_pattern_consistent":           "pattern",
	"trips_shape_id_max_two_per_route":                 "route",
	"trips_trip_headsign_max_two_per_route":            "route",
	"trips_shape_id_route_direction_consistent":        "route",
	"trips_trip_headsign_route_direction_consistent":   "route",
	"stop_times_arrival_departure_time_sequence":       "trip",
	"shape_id_and_point_sequence_required":             "shape",
	"shape_pt_sequence_strictly_increasing":            "shape",
	"shape_dist_traveled_non_decreasing_with_sequence": "shape",
	"shapes_shape_point_spacing_valid":                 "shape",
	"shapes_shape_dist_traveled_segment_valid":         "shape",
	"shapes_shape_dist_traveled_block_valid":           "shape",
}
