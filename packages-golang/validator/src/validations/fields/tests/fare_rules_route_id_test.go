package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestFareRulesRouteIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "fare_rules_route_id_field",
		table: "fare_rules",
		field: "route_id",
		run:   fields.FareRulesRouteIdField,
	})
}
