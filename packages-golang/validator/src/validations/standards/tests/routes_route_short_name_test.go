package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestRoutesRouteShortName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_route_short_name_field",
		table: "routes",
		field: "route_short_name",
		run:   standard.RouteShortNameField,
	})
}
