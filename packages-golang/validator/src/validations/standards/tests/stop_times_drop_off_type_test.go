package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopTimesDropOffType(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stop_times_drop_off_type_field",
		table: "stop_times",
		field: "drop_off_type",
		run:   standard.DropOffTypeField,
	})
}
