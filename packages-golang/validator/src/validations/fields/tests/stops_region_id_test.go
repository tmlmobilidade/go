package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestRegionIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_region_id_field",
		table: "stops",
		field: "region_id",
		run:   fields.RegionIdField,
	})
}
