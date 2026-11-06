package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestTripsDirectionId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "trips_direction_id_field",
		table: "trips",
		field: "direction_id",
		run:   standard.DirectionIdField,
	})
}
