package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestRoutesRouteDesc(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_route_desc_field",
		table: "routes",
		field: "route_desc",
		run:   standard.RouteDescField,
	})
}
