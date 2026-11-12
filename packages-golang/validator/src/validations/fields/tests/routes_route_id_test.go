package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestRoutesRouteIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_route_id_field",
		table: "routes",
		field: "route_id",
		run:   fields.RoutesRouteIdField,
	})
}
