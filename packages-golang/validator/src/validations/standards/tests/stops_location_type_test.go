package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsLocationType(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_location_type_field",
		table: "stops",
		field: "location_type",
		run:   standard.LocationTypeField,
	})
}
