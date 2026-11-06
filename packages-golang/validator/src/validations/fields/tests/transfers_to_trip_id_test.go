package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestToTripIdField(t *testing.T) {
	check := fieldCheck{
		id:    "transfers_to_trip_id_field",
		table: "transfers",
		field: "to_trip_id",
		run:   fields.ToTripIdField,
	}
	checkConditional(t, check, []string{"to_trip_id", "transfer_type"}, []conditionalCase{
		{name: "type_0", values: []any{"", "0"}, key: "recommended"},
		{name: "type_1", values: []any{"", "1"}, key: "recommended"},
		{name: "type_2", values: []any{"", "2"}, key: "recommended"},
		{name: "type_3", values: []any{"", "3"}, key: "recommended"},
		{name: "type_4", values: []any{"", "4"}, key: "required"},
		{name: "type_5", values: []any{"", "5"}, key: "required"},
		{name: "type_6", values: []any{"", "6"}, key: "recommended"},
		{name: "type_-1", values: []any{"", "-1"}, key: "recommended"},
		{name: "type_invalid", values: []any{"", "invalid"}, key: "recommended"},
		{name: "type_missing", values: []any{"", ""}, key: "recommended"},
		{name: "type_null", values: []any{"", nil}, key: "recommended"},
		{name: "null_required_trip", values: []any{nil, "4"}, key: "required"},
		{name: "present_required_trip", values: []any{"T1", "4"}, key: ""},
	}, "recommended")
}
