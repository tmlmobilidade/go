package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestPickupBookingRuleIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stop_times_pickup_booking_rule_id_field",
		table: "stop_times",
		field: "pickup_booking_rule_id",
		run:   fields.PickupBookingRuleIdField,
	})
}
