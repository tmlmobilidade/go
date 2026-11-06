package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestTransfersMinTransferTime(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "transfers_min_transfer_time_field",
		table: "transfers",
		field: "min_transfer_time",
		run:   standard.MinTransferTimeField,
	})
}
