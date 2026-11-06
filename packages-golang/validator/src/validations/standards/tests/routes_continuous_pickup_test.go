package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestRoutesContinuousPickup(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_continuous_pickup_field",
		table: "routes",
		field: "continuous_pickup",
		run:   standard.RoutesContinuousPickupField,
	})
}
