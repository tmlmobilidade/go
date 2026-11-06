package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFareRulesDestinationId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_rules_destination_id_field",
		table: "fare_rules",
		field: "destination_id",
		run:   standard.DestinationIdField,
	})
}
