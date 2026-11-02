package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestPickupBookingRuleIdField(t *testing.T) {
	validationutils.StopTimesCheckPresence(t, "pickup_booking_rule_id", fields.PickupBookingRuleIdField)
}
