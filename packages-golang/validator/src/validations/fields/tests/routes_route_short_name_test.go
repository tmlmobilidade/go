package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestRouteShortNameField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_route_short_name_field",
		table: "routes",
		field: "route_short_name",
		run:   fields.RouteShortNameField,
	})
}
