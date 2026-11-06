package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestRoutesContinuousDropOff(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_continuous_drop_off_field",
		table: "routes",
		field: "continuous_drop_off",
		run:   standard.RoutesContinuousDropOffField,
	})
}
