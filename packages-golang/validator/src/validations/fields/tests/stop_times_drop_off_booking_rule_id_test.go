package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestDropOffBookingRuleIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stop_times_drop_off_booking_rule_id_field",
		table: "stop_times",
		field: "drop_off_booking_rule_id",
		run:   fields.DropOffBookingRuleIdField,
	})
}
