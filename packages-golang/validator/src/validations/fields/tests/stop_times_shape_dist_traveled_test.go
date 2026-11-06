package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestStopTimesShapeDistTraveledField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stop_times_shape_dist_traveled_field",
		table: "stop_times",
		field: "shape_dist_traveled",
		run:   fields.StopTimesShapeDistTraveledField,
	})
}
