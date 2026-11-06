package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestFareRulesContainsId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_rules_contains_id_field",
		table: "fare_rules",
		field: "contains_id",
		run:   standard.ContainsIdField,
	})
}
