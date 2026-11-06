package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestMinTransferTimeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "transfers_min_transfer_time_field",
		table: "transfers",
		field: "min_transfer_time",
		run:   fields.MinTransferTimeField,
	})
}
