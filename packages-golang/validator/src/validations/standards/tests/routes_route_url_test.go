package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRoutesRouteUrl(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_route_url_field",
		table: "routes",
		field: "route_url",
		run:   standard.RouteUrlField,
	})
}
