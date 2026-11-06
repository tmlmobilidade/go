package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestFareRulesOriginId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_rules_origin_id_field",
		table: "fare_rules",
		field: "origin_id",
		run:   standard.OriginIdField,
	})
}
