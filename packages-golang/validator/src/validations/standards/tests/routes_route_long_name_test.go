package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRoutesRouteLongName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_route_long_name_field",
		table: "routes",
		field: "route_long_name",
		run:   standard.RouteLongNameField,
	})
}
