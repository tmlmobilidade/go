package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsZoneId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "stops_zone_id_field",
		table:         "stops",
		field:         "zone_id",
		run:           standard.ZoneIdField,
		skipForbidden: true,
	})
}
