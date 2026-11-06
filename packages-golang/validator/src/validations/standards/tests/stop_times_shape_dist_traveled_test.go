package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopTimesShapeDistTraveled(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stop_times_shape_dist_traveled_field",
		table: "stop_times",
		field: "shape_dist_traveled",
		run:   standard.StopTimesShapeDistTraveledField,
	})
}
