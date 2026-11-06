package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsShelterCode(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_shelter_code_field",
		table: "stops",
		field: "shelter_code",
		run:   standard.ShelterCodeField,
	})
}
