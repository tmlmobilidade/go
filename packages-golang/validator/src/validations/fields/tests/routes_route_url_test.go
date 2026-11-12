package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestRouteUrlField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_route_url_field",
		table: "routes",
		field: "route_url",
		run:   fields.RouteUrlField,
	})
}
