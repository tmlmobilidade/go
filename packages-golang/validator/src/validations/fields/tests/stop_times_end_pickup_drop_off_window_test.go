package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestEndPickupDropOffWindowField(t *testing.T) {
	check := fieldCheck{
		id:              "stop_times_end_pickup_drop_off_window_field",
		table:           "stop_times",
		field:           "end_pickup_drop_off_window",
		run:             fields.EndPickupDropOffWindowField,
		skipForbidden:   true,
		severityWording: true,
	}
	checkConditional(t, check, []string{"end_pickup_drop_off_window", "arrival_time", "departure_time"}, []conditionalCase{
		{name: "empty", values: []any{"", "", ""}, key: "required"},
		{name: "null", values: []any{nil, nil, nil}, key: "required"},
		{name: "window", values: []any{"12:00:00", "", ""}, key: ""},
		{name: "arrival", values: []any{"", "12:00:00", ""}, key: ""},
		{name: "departure", values: []any{"", "", "12:00:00"}, key: ""},
		{name: "both_times", values: []any{"", "12:00:00", "12:01:00"}, key: ""},
	}, "required")
}
