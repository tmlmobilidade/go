package standard_test

import (
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
)

func TestShapeSequenceOrdering(t *testing.T) {
	for _, tc := range []struct {
		name, id string
		rows     [][]any
		expected []int
	}{
		{"shuffled_points_are_sorted_numerically", "shape_pt_sequence_strictly_increasing", [][]any{{"A", "10", "20"}, {"A", "2", "10"}, {"B", "1", "100"}}, nil},
		{"repeated_sequence_keeps_original_row", "shape_pt_sequence_strictly_increasing", [][]any{{"A", "1", "0"}, {"A", "1", "10"}, {"B", "1", "100"}}, []int{4}},
		{"distance_decreases_in_sequence_order", "shape_dist_traveled_non_decreasing_with_sequence", [][]any{{"A", "10", "5"}, {"A", "2", "10"}, {"B", "1", "100"}}, []int{1}},
		{"equal_distances_are_allowed", "shape_dist_traveled_non_decreasing_with_sequence", [][]any{{"A", "1", "10"}, {"A", "2", "10"}, {"B", "1", "0"}}, nil},
		{"unknown_distance_breaks_comparison", "shape_dist_traveled_non_decreasing_with_sequence", [][]any{{"A", "1", "10"}, {"A", "2", ""}, {"A", "3", "5"}}, nil},
		{"nan_distance_breaks_comparison", "shape_dist_traveled_non_decreasing_with_sequence", [][]any{{"A", "1", "10"}, {"A", "2", "NaN"}, {"A", "3", "5"}}, nil},
		{"negative_distance_breaks_comparison", "shape_dist_traveled_non_decreasing_with_sequence", [][]any{{"A", "1", "10"}, {"A", "2", "-1"}, {"A", "3", "5"}}, nil},
		{"malformed_sequence_left_to_value_rule", "shape_dist_traveled_non_decreasing_with_sequence", [][]any{{"A", "1", "10"}, {"A", "bad", "5"}, {"A", "3", "1"}}, nil},
	} {
		t.Run(tc.name, func(t *testing.T) {
			check := namedCheck(t, tc.id)
			db := fixture(t, "shapes", []string{"shape_id", "shape_pt_sequence", "shape_dist_traveled"}, []int{2, 5, 8}, tc.rows)
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
			assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, tc.expected...)
		})
	}
}

func TestStopTimeSequences(t *testing.T) {
	check := namedCheck(t, "stop_times_arrival_departure_time_sequence")
	for _, tc := range []struct {
		name     string
		rows     [][]any
		expected []int
	}{
		{"numeric_sequence_sort_and_original_row", [][]any{{"A", "10", "10:00:00", "10:00:00"}, {"A", "2", "11:00:00", "11:00:00"}, {"B", "1", "23:00:00", "23:00:00"}}, []int{1}},
		{"compare_previous_departure_to_next_arrival", [][]any{{"A", "1", "10:00:00", "12:00:00"}, {"A", "2", "11:00:00", "13:00:00"}, {"B", "1", "01:00:00", "01:00:00"}}, []int{4}},
		{"fallback_times_and_after_midnight", [][]any{{"A", "1", "", "24:30:00"}, {"A", "2", "25:00:00", ""}, {"B", "1", "01:00:00", "01:00:00"}}, nil},
		{"equal_times_are_allowed", [][]any{{"A", "1", "10:00:00", "10:00:00"}, {"A", "2", "10:00:00", "10:00:00"}, {"B", "1", "01:00:00", "01:00:00"}}, nil},
		{"missing_time_breaks_comparison", [][]any{{"A", "1", "11:00:00", "11:00:00"}, {"A", "2", "", ""}, {"A", "3", "10:00:00", "10:00:00"}}, nil},
		{"malformed_time_breaks_comparison", [][]any{{"A", "1", "11:00:00", "11:00:00"}, {"A", "2", "bad", "99:99:99"}, {"A", "3", "10:00:00", "10:00:00"}}, nil},
		{"trips_are_independent", [][]any{{"A", "1", "23:00:00", "23:00:00"}, {"B", "1", "01:00:00", "01:00:00"}, {"B", "2", "02:00:00", "02:00:00"}}, nil},
	} {
		t.Run(tc.name, func(t *testing.T) {
			db := fixture(t, "stop_times", []string{"trip_id", "stop_sequence", "arrival_time", "departure_time"}, []int{2, 5, 8}, tc.rows)
			// Running the same rule again must not retain an old per-trip seen set.
			for range 2 {
				ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
				assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, tc.expected...)
			}
		})
	}
}

func TestRouteWindowLookupBelongsToEachInvocation(t *testing.T) {
	for _, id := range []string{"routes_continuous_pickup_valid", "routes_continuous_drop_off_valid"} {
		t.Run(id, func(t *testing.T) {
			check := namedCheck(t, id)
			for _, window := range []bool{true, false, true} {
				db := fixture(t, "routes", []string{"route_id", check.field}, []int{2, 5, 8, 11}, [][]any{{"route", "0"}, {"allowed", "1"}, {"no-trip", "0"}, {"bad", "x"}})
				addTable(t, db, "trips", []string{"trip_id", "route_id"}, []int{2, 5}, [][]any{{"trip", "route"}, {"other", "allowed"}})
				value := ""
				if window {
					value = "10:00:00"
				}
				addTable(t, db, "stop_times", []string{"trip_id", "start_pickup_drop_off_window", "end_pickup_drop_off_window"}, []int{2, 5}, [][]any{{"trip", value, ""}, {"other", "", "11:00:00"}})
				expected := []int{10}
				if window {
					expected = []int{1, 10}
				}
				ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
				assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, expected...)
			}
		})
	}
}
