package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestHasTariffsInformationField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_has_tariffs_information_field",
		table: "stops",
		field: "has_tariffs_information",
		run:   fields.HasTariffsInformationField,
	})
}
