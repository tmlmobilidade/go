package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestRouteColorField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_route_color_field",
		table: "routes",
		field: "route_color",
		run:   fields.RouteColorField,
	})
}
