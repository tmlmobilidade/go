package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestTripsBlockId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "trips_block_id_field",
		table: "trips",
		field: "block_id",
		run:   standard.BlockIdField,
	})
}
