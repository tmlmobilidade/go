package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestRoutesContinuousDropOffField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_continuous_drop_off_field",
		table: "routes",
		field: "continuous_drop_off",
		run:   fields.RoutesContinuousDropOffField,
	})
}
