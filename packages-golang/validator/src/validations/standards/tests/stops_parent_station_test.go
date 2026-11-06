package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestStopsParentStation(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_parent_station_field",
		table: "stops",
		field: "parent_station",
		run:   standard.ParentStationField,
	})
}
