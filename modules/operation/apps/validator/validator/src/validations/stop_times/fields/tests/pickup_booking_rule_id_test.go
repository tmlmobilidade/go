package stop_times_fields_test

import (
	checks "main/validations/stop_times/fields/checks"
	testutils "main/validations/stop_times/utils"
	"testing"
)

func TestPickupBookingRuleIdField(t *testing.T) {
	testutils.CheckPresence(t, "pickup_booking_rule_id", checks.PickupBookingRuleIdField)
}
