package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestFrequenciesTripIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "frequencies_trip_id_field",
		table: "frequencies",
		field: "trip_id",
		run:   fields.FrequenciesTripIdField,
	})
}
