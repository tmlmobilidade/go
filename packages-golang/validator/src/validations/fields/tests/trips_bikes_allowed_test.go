package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestBikesAllowedField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "trips_bikes_allowed_field",
		table: "trips",
		field: "bikes_allowed",
		run:   fields.BikesAllowedField,
	})
}
