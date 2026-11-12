package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStopTimesContinuousDropOffField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "stop_times_continuous_drop_off_field",
		table:         "stop_times",
		field:         "continuous_drop_off",
		run:           fields.StopTimesContinuousDropOffField,
		skipForbidden: true,
	})
}
