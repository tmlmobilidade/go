package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsHasShelter(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_has_shelter_field",
		table: "stops",
		field: "has_shelter",
		run:   standard.HasShelterField,
	})
}
