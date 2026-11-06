package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestLocationTypeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_location_type_field",
		table: "stops",
		field: "location_type",
		run:   fields.LocationTypeField,
	})
}
