package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestHasPipRealTimeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_has_pip_real_time_field",
		table: "stops",
		field: "has_pip_real_time",
		run:   fields.HasPipRealTimeField,
	})
}
