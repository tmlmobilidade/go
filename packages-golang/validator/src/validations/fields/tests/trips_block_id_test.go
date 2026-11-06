package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestBlockIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "trips_block_id_field",
		table: "trips",
		field: "block_id",
		run:   fields.BlockIdField,
	})
}
