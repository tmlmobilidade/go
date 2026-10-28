package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestParentStationForLocationTypeOne(t *testing.T) {
	testutils.CheckCases(t, "stops_parent_station_for_location_type_one", "parent_station", checks.ParentStationForLocationTypeOne, []testutils.Case{
		{Name: "Location0", Values: map[string]any{"location_type": "0", "parent_station": "value"}, Count: 1},
		{Name: "Location1", Values: map[string]any{"location_type": "1", "parent_station": "value"}},
		{Name: "Location2", Values: map[string]any{"location_type": "2", "parent_station": "value"}, Count: 1},
		{Name: "Location3", Values: map[string]any{"location_type": "3", "parent_station": "value"}, Count: 1},
		{Name: "Location4", Values: map[string]any{"location_type": "4", "parent_station": "value"}, Count: 1},
		{Name: "Location", Values: map[string]any{"location_type": "", "parent_station": "value"}, Count: 1},
		{Name: "LocationNone", Values: map[string]any{"location_type": nil, "parent_station": "value"}, Count: 1},
		{Name: "Location01", Values: map[string]any{"location_type": "01", "parent_station": "value"}, Count: 1},
		{Name: "Locationbad", Values: map[string]any{"location_type": "bad", "parent_station": "value"}, Count: 1},
		{Name: "MissingLocationType", Values: map[string]any{"parent_station": "value"}, Count: 1},
	})
}
