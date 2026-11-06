package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsWheelchairBoarding(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_wheelchair_boarding_field",
		table: "stops",
		field: "wheelchair_boarding",
		run:   standard.WheelchairBoardingField,
	})
}
