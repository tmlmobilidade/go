package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestTransfersTransferType(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "transfers_transfer_type_field",
		table: "transfers",
		field: "transfer_type",
		run:   standard.TransferTypeField,
	})
}
