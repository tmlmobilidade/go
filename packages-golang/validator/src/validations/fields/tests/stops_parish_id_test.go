package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestParishIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_parish_id_field",
		table: "stops",
		field: "parish_id",
		run:   fields.ParishIdField,
	})
}
