package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestTransferTypeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "transfers_transfer_type_field",
		table: "transfers",
		field: "transfer_type",
		run:   fields.TransferTypeField,
	})
}
