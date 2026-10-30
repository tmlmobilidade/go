package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestLocationGroupIdField(t *testing.T) {
	validationutils.StopTimesCheckCases(t, "stop_times_location_group_id_field", "location_group_id", fields.LocationGroupIdField, []validationutils.StopTimesCase{

		{Name: "MissingColumns", Values: map[string]any{}},
		{Name: "Null", Values: map[string]any{"location_group_id": nil}},
		{Name: "GroupOnly", Values: map[string]any{"location_group_id": "G1"}},
		{Name: "MatchingStop", Values: map[string]any{"location_group_id": "G1", "stop_id": "G1"}, Count: 1},
		{Name: "MatchingLocation", Values: map[string]any{"location_group_id": "G1", "location_id": "G1"}, Count: 1},
		{Name: "DifferentIdentifiers", Values: map[string]any{"location_group_id": "G1", "stop_id": "S1", "location_id": "L1"}},
	})
}
