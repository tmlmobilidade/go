package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestRoutesContinuousPickupField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_continuous_pickup_field",
		table: "routes",
		field: "continuous_pickup",
		run:   fields.RoutesContinuousPickupField,
	})
}
