package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestShapeDistTraveledNonDecreasing(t *testing.T) {
	const id = "shape_dist_traveled_non_decreasing_with_sequence"
	for _, tc := range []struct {
		name      string
		distances []string
		severity  types.Severity
		rows      []int
		nilRules  bool
	}{
		// CSV sequences are 20, 0, 10: the point at sequence 20 is on CSV row 5.
		{name: "IncreasingInSequenceOrder", distances: []string{"20", "0", "10"}, severity: types.SEVERITY_ERROR},
		{name: "EqualDistances", distances: []string{"10", "10", "10"}, severity: types.SEVERITY_ERROR},
		{name: "Decrease", distances: []string{"5", "0", "10"}, severity: types.SEVERITY_ERROR, rows: []int{5}},
		{name: "ResetToZeroIsDecrease", distances: []string{"0", "0", "10"}, severity: types.SEVERITY_ERROR, rows: []int{5}},
		{name: "MissingColumn", severity: types.SEVERITY_ERROR},
		{name: "MissingMiddleBreaksChain", distances: []string{"0", "10", ""}, severity: types.SEVERITY_ERROR},
		{name: "MalformedMiddleBreaksChain", distances: []string{"0", "10", "bad"}, severity: types.SEVERITY_ERROR},
		{name: "NegativeMiddleBreaksChain", distances: []string{"0", "10", "-1"}, severity: types.SEVERITY_ERROR},
		{name: "NaNMiddleBreaksChain", distances: []string{"0", "10", "NaN"}, severity: types.SEVERITY_ERROR},
		{name: "Warning", distances: []string{"5", "0", "10"}, severity: types.SEVERITY_WARNING, rows: []int{5}},
		{name: "Info", distances: []string{"5", "0", "10"}, severity: types.SEVERITY_INFO, rows: []int{5}},
		{name: "Ignore", distances: []string{"5", "0", "10"}, severity: types.SEVERITY_IGNORE},
		{name: "MissingSeverity", distances: []string{"5", "0", "10"}},
		{name: "NilRules", distances: []string{"5", "0", "10"}, nilRules: true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			db, table := sequenceTable(t, []string{"20", "0", "10"}, tc.distances)
			config := validationutils.TestRules(t, id, tc.severity)
			if tc.nilRules {
				config = nil
			}
			if err := standard.ShapeDistTraveledNonDecreasing(table.At(3).Context(), config.Rule("shape_dist_traveled_non_decreasing_with_sequence")); err != nil {
				t.Fatal(err)
			}
			validationutils.AssertShapeFindings(t, id, "shape_dist_traveled", tc.severity, tc.rows...)
			db.Close()
			if err := standard.ShapeDistTraveledNonDecreasing(table.At(3).Context(), config.Rule("shape_dist_traveled_non_decreasing_with_sequence")); err == nil {
				t.Fatal("SQLite failure swallowed")
			}
		})
	}
}
