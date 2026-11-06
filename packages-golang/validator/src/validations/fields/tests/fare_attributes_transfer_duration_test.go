package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestTransferDurationField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "fare_attributes_transfer_duration_field",
		table: "fare_attributes",
		field: "transfer_duration",
		run:   fields.TransferDurationField,
	})
}
