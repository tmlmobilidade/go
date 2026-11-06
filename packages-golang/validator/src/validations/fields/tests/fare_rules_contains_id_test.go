package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestContainsIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "fare_rules_contains_id_field",
		table: "fare_rules",
		field: "contains_id",
		run:   fields.ContainsIdField,
	})
}
