package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestFridayValidation(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "calendar_friday_field",
		table:         "calendar",
		field:         "friday",
		run:           fields.FridayValidation,
		skipForbidden: true,
	})
}
