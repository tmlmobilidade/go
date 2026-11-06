package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRoutesRouteColor(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_route_color_field",
		table: "routes",
		field: "route_color",
		run:   standard.RouteColorField,
	})
}
