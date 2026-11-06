package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsHasSchedules(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_has_schedules_field",
		table: "stops",
		field: "has_schedules",
		run:   standard.HasSchedulesField,
	})
}
