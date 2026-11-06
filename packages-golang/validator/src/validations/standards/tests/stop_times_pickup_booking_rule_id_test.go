package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopTimesPickupBookingRuleId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stop_times_pickup_booking_rule_id_field",
		table: "stop_times",
		field: "pickup_booking_rule_id",
		run:   standard.PickupBookingRuleIdField,
	})
}
