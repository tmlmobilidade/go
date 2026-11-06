package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestCalendarDatesServiceIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "calendar_dates_service_id_field",
		table:         "calendar_dates",
		field:         "service_id",
		run:           fields.CalendarDatesServiceIdField,
		skipForbidden: true,
	})
}
