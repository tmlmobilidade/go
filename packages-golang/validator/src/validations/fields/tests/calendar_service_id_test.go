package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestServiceIdValidation(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "calendar_service_id_field",
		table:         "calendar",
		field:         "service_id",
		run:           fields.ServiceIdValidation,
		skipForbidden: true,
	})
}
