package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFareRulesFareId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_rules_fare_id_field",
		table: "fare_rules",
		field: "fare_id",
		run:   standard.FareRulesFareIdField,
	})
}
