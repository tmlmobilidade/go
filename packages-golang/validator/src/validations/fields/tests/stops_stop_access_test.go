package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestStopAccessField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "stops_stop_access_field",
		table:         "stops",
		field:         "stop_access",
		run:           fields.StopAccessField,
		skipForbidden: true,
	})
}
