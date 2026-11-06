package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsParishId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_parish_id_field",
		table: "stops",
		field: "parish_id",
		run:   standard.ParishIdField,
	})
}
