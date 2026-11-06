package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsHasTariffsInformation(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_has_tariffs_information_field",
		table: "stops",
		field: "has_tariffs_information",
		run:   standard.HasTariffsInformationField,
	})
}
