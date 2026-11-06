package fields_test

import (
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestLocationGroupIdField(t *testing.T) {
	check := fieldCheck{
		id:    "stop_times_location_group_id_field",
		table: "stop_times",
		field: "location_group_id",
		run:   fields.LocationGroupIdField,
	}
	checkConditional(t, check, []string{"location_group_id", "stop_id", "location_id"}, []conditionalCase{
		{name: "stop_match", values: []any{"G1", "G1", "L1"}, key: "forbidden_stop_location"},
		{name: "location_match", values: []any{"G1", "S1", "G1"}, key: "forbidden_stop_location"},
		{name: "no_match", values: []any{"G1", "S1", "L1"}, key: ""},
		{name: "null", values: []any{nil, nil, nil}, key: ""},
		{name: "empty_identifiers", values: []any{"", "", ""}, key: "forbidden_stop_location"},
	}, "")

	t.Run("reference_in_another_row", func(t *testing.T) {
		db := fixture(t, check.table, []string{"location_group_id", "stop_id", "location_id"}, []int{2, 8}, [][]any{{"G1", "S1", "L1"}, {"G2", "G1", "L2"}})
		assertCheck(t, check, db, rules.SEVERITY_ERROR, []int{1}, "forbidden_stop_location")
	})
}
