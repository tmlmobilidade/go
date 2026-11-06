package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestDestinationIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "fare_rules_destination_id_field",
		table: "fare_rules",
		field: "destination_id",
		run:   fields.DestinationIdField,
	})
}
