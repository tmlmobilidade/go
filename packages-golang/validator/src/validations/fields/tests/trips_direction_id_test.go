package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestDirectionIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "trips_direction_id_field",
		table: "trips",
		field: "direction_id",
		run:   fields.DirectionIdField,
	})
}
