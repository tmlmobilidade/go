package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRoutesRouteTextColor(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_route_text_color_field",
		table: "routes",
		field: "route_text_color",
		run:   standard.RouteTextColorField,
	})
}
