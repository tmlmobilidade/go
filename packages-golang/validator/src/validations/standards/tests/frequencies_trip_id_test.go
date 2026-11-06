package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFrequenciesTripId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "frequencies_trip_id_field",
		table: "frequencies",
		field: "trip_id",
		run:   standard.FrequenciesTripIdField,
	})
}
