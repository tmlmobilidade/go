package shapes_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/shapes/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/shapes/utils"
	"main/types"
	"testing"
)

func TestShapePtSequenceStrictlyIncreasing(t *testing.T) {
	const id = "shape_pt_sequence_strictly_increasing"
	for _, tc := range []struct {
		name      string
		sequences []string
		severity  types.Severity
		rows      []int
		nilRules  bool
	}{
		{name: "NumericOrderNotCSVOrder", sequences: []string{"20", "0", "10"}, severity: types.SEVERITY_ERROR},
		{name: "SinglePoint", sequences: []string{"0"}, severity: types.SEVERITY_ERROR},
		{name: "Duplicate", sequences: []string{"10", "0", "10"}, severity: types.SEVERITY_ERROR, rows: []int{9}},
		{name: "DuplicateZero", sequences: []string{"0", "0"}, severity: types.SEVERITY_ERROR, rows: []int{7}},
		{name: "Warning", sequences: []string{"0", "0"}, severity: types.SEVERITY_WARNING, rows: []int{7}},
		{name: "Info", sequences: []string{"0", "0"}, severity: types.SEVERITY_INFO, rows: []int{7}},
		{name: "Ignore", sequences: []string{"0", "0"}, severity: types.SEVERITY_IGNORE},
		{name: "MissingSeverity", sequences: []string{"0", "0"}},
		{name: "NilRules", sequences: []string{"0", "0"}, nilRules: true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			db, table := sequenceTable(t, tc.sequences, nil)
			config := testutils.TestRules(t, id, tc.severity)
			if tc.nilRules {
				config = nil
			}
			if err := checks.ShapePtSequenceStrictlyIncreasing(table.At(3).Context(), config.Rule("shape_pt_sequence_strictly_increasing")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertShapeFindings(t, id, "shape_pt_sequence", tc.severity, tc.rows...)
			db.Close()
			if err := checks.ShapePtSequenceStrictlyIncreasing(table.At(3).Context(), config.Rule("shape_pt_sequence_strictly_increasing")); err == nil {
				t.Fatal("SQLite failure swallowed")
			}
		})
	}
}
