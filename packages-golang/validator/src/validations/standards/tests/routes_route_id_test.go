package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRoutesRouteId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_route_id_field",
		table: "routes",
		field: "route_id",
		run:   standard.RoutesRouteIdField,
	})
}
