package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestSaturdayValidation(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "calendar_saturday_field",
		table:         "calendar",
		field:         "saturday",
		run:           fields.SaturdayValidation,
		skipForbidden: true,
	})
}
