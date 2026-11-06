package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestTransfersFromStopIdField(t *testing.T) {
	check := fieldCheck{
		id:              "transfers_from_stop_id_field",
		table:           "transfers",
		field:           "from_stop_id",
		run:             fields.TransfersFromStopIdField,
		severityWording: true,
	}
	checkConditional(t, check, []string{"from_stop_id", "transfer_type"}, []conditionalCase{
		{name: "type_0", values: []any{"", "0"}, key: ""},
		{name: "type_1", values: []any{"", "1"}, key: "required"},
		{name: "type_2", values: []any{"", "2"}, key: "required"},
		{name: "type_3", values: []any{"", "3"}, key: "required"},
		{name: "type_4", values: []any{"", "4"}, key: ""},
		{name: "type_5", values: []any{"", "5"}, key: ""},
		{name: "type_6", values: []any{"", "6"}, key: ""},
		{name: "type_-1", values: []any{"", "-1"}, key: ""},
		{name: "type_invalid", values: []any{"", "invalid"}, key: ""},
		{name: "type_missing", values: []any{"", ""}, key: ""},
		{name: "type_null", values: []any{"", nil}, key: ""},
		{name: "null_required_stop", values: []any{nil, "2"}, key: "required"},
		{name: "present_required_stop", values: []any{"S1", "1"}, key: ""},
	}, "")
}
