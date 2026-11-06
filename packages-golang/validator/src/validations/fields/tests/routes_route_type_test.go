package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestRouteTypeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_route_type_field",
		table: "routes",
		field: "route_type",
		run:   fields.RouteTypeField,
	})
}
