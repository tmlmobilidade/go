package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestZoneIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "stops_zone_id_field",
		table:         "stops",
		field:         "zone_id",
		run:           fields.ZoneIdField,
		skipForbidden: true,
	})
}
