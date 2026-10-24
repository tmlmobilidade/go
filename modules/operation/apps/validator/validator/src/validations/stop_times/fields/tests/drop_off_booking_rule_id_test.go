package stop_times_fields_test

import (
	checks "main/validations/stop_times/fields/checks"
	testutils "main/validations/stop_times/utils"
	"testing"
)

func TestDropOffBookingRuleIdField(t *testing.T) {
	testutils.CheckPresence(t, "drop_off_booking_rule_id", checks.DropOffBookingRuleIdField)
}
