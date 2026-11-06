package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestCalendarServiceId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "calendar_service_id_field",
		table:         "calendar",
		field:         "service_id",
		run:           standard.ServiceIdValidation,
		skipForbidden: true,
	})
}
