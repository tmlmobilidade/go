package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestFareRulesFareIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "fare_rules_fare_id_field",
		table: "fare_rules",
		field: "fare_id",
		run:   fields.FareRulesFareIdField,
	})
}
