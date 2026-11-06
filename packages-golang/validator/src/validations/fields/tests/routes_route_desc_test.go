package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestRouteDescField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_route_desc_field",
		table: "routes",
		field: "route_desc",
		run:   fields.RouteDescField,
	})
}
