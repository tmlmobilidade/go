package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestRouteTextColorField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_route_text_color_field",
		table: "routes",
		field: "route_text_color",
		run:   fields.RouteTextColorField,
	})
}
