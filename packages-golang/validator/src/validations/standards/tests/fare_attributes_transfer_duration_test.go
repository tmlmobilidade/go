package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestFareAttributesTransferDuration(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "fare_attributes_transfer_duration_field",
		table: "fare_attributes",
		field: "transfer_duration",
		run:   standard.TransferDurationField,
	})
}
