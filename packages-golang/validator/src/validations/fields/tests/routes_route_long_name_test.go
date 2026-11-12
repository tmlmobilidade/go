package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestRouteLongNameField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_route_long_name_field",
		table: "routes",
		field: "route_long_name",
		run:   fields.RouteLongNameField,
	})
}
