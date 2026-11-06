package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestCalendarDatesServiceId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "calendar_dates_service_id_field",
		table:         "calendar_dates",
		field:         "service_id",
		run:           standard.CalendarDatesServiceIdField,
		skipForbidden: true,
	})
}
