package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsRegionId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_region_id_field",
		table: "stops",
		field: "region_id",
		run:   standard.RegionIdField,
	})
}
