package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFareAttributesTransfers(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_attributes_transfers_field",
		table: "fare_attributes",
		field: "transfers",
		run:   standard.TransfersField,
	})
}
