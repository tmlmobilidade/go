package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRoutesRouteType(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_route_type_field",
		table: "routes",
		field: "route_type",
		run:   standard.RouteTypeField,
	})
}
