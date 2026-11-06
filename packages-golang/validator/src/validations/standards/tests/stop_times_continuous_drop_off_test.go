package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopTimesContinuousDropOff(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "stop_times_continuous_drop_off_field",
		table:         "stop_times",
		field:         "continuous_drop_off",
		run:           standard.StopTimesContinuousDropOffField,
		skipForbidden: true,
	})
}
