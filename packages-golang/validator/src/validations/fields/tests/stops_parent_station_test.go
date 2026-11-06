package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestParentStationField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_parent_station_field",
		table: "stops",
		field: "parent_station",
		run:   fields.ParentStationField,
	})
}
