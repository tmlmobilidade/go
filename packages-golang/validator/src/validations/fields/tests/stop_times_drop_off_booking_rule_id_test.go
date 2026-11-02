package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestDropOffBookingRuleIdField(t *testing.T) {
	validationutils.StopTimesCheckPresence(t, "drop_off_booking_rule_id", fields.DropOffBookingRuleIdField)
}
