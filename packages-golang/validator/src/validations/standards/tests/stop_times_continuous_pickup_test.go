package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopTimesContinuousPickup(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "stop_times_continuous_pickup_field",
		table:         "stop_times",
		field:         "continuous_pickup",
		run:           standard.StopTimesContinuousPickupField,
		skipForbidden: true,
	})
}
