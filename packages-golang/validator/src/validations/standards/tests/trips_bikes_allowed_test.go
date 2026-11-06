package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestTripsBikesAllowed(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "trips_bikes_allowed_field",
		table: "trips",
		field: "bikes_allowed",
		run:   standard.BikesAllowedField,
	})
}
