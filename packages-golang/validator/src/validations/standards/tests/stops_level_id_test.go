package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsLevelId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_level_id_field",
		table: "stops",
		field: "level_id",
		run:   standard.StopsLevelIdField,
	})
}
