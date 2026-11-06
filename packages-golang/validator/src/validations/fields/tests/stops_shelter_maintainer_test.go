package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestShelterMaintainerField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_shelter_maintainer_field",
		table: "stops",
		field: "shelter_maintainer",
		run:   fields.ShelterMaintainerField,
	})
}
