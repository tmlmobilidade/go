package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsShelterMaintainer(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_shelter_maintainer_field",
		table: "stops",
		field: "shelter_maintainer",
		run:   standard.ShelterMaintainerField,
	})
}
