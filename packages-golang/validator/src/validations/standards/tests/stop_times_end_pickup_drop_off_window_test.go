package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopTimesEndPickupDropOffWindow(t *testing.T) {
	check := standardCheck{
		id:              "stop_times_end_pickup_drop_off_window_field",
		table:           "stop_times",
		field:           "end_pickup_drop_off_window",
		run:             standard.EndPickupDropOffWindowField,
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
