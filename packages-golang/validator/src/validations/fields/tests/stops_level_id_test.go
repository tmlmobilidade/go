package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStopsLevelIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_level_id_field",
		table: "stops",
		field: "level_id",
		run:   fields.StopsLevelIdField,
	})
}
