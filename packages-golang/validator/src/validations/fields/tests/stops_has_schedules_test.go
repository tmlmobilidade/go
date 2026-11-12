package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestHasSchedulesField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_has_schedules_field",
		table: "stops",
		field: "has_schedules",
		run:   fields.HasSchedulesField,
	})
}
