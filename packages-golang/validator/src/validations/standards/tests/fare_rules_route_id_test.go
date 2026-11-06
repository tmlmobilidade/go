package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFareRulesRouteId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_rules_route_id_field",
		table: "fare_rules",
		field: "route_id",
		run:   standard.FareRulesRouteIdField,
	})
}
