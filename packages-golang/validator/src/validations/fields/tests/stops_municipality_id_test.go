package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestMunicipalityIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_municipality_id_field",
		table: "stops",
		field: "municipality_id",
		run:   fields.MunicipalityIdField,
	})
}
