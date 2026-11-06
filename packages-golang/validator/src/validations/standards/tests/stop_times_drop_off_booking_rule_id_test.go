package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopTimesDropOffBookingRuleId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stop_times_drop_off_booking_rule_id_field",
		table: "stop_times",
		field: "drop_off_booking_rule_id",
		run:   standard.DropOffBookingRuleIdField,
	})
}
