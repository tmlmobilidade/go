package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestRouteSortOrderField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_route_sort_order_field",
		table: "routes",
		field: "route_sort_order",
		run:   fields.RouteSortOrderField,
	})
}
