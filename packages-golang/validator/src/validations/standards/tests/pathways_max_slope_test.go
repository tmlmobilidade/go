package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestPathwaysMaxSlope(t *testing.T) {
	check := standardCheck{
		id:              "pathways_max_slope_field",
		table:           "pathways",
		field:           "max_slope",
		run:             standard.MaxSlopeField,
		severityWording: true,
	}
	checkConditional(t, check, []string{"max_slope", "pathway_mode"}, []conditionalCase{
		{name: "mode_0", values: []any{"", "0"}, key: "required"},
		{name: "mode_1", values: []any{"", "1"}, key: "recommended"},
		{name: "mode_2", values: []any{"", "2"}, key: "required"},
		{name: "mode_3", values: []any{"", "3"}, key: "recommended"},
		{name: "mode_4", values: []any{"", "4"}, key: "required"},
		{name: "mode_5", values: []any{"", "5"}, key: "required"},
		{name: "mode_6", values: []any{"", "6"}, key: "required"},
		{name: "mode_7", values: []any{"", "7"}, key: "required"},
		{name: "mode_-1", values: []any{"", "-1"}, key: "required"},
		{name: "mode_invalid", values: []any{"", "invalid"}, key: "required"},
		{name: "mode_missing", values: []any{"", ""}, key: "required"},
		{name: "mode_null", values: []any{"", nil}, key: "required"},
		{name: "null_value", values: []any{nil, "2"}, key: "required"},
		{name: "present", values: []any{"1", "1"}, key: ""},
	}, "required")
}
