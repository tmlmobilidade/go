package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestOriginIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "fare_rules_origin_id_field",
		table: "fare_rules",
		field: "origin_id",
		run:   fields.OriginIdField,
	})
}
