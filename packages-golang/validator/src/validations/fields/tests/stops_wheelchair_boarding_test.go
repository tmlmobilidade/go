package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestWheelchairBoardingField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_wheelchair_boarding_field",
		table: "stops",
		field: "wheelchair_boarding",
		run:   fields.WheelchairBoardingField,
	})
}
