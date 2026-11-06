package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsMunicipalityId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_municipality_id_field",
		table: "stops",
		field: "municipality_id",
		run:   standard.MunicipalityIdField,
	})
}
