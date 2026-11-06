package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopTimesTimepoint(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stop_times_timepoint_field",
		table: "stop_times",
		field: "timepoint",
		run:   standard.TimepointField,
	})
}
