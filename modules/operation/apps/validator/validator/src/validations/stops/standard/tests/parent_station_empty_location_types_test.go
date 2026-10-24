package stops_standard_test

import (
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestParentStationEmptyLocationTypes(t *testing.T) {
	testutils.CheckCases(t, "stops_parent_station_empty_location_types", "parent_station", checks.ParentStationEmptyLocationTypes, []testutils.Case{
		{Name: "Type0Empty", Values: map[string]any{"location_type": "0", "parent_station": ""}},
		{Name: "Type0Parent", Values: map[string]any{"location_type": "0", "parent_station": "station"}},
		{Name: "Type1Empty", Values: map[string]any{"location_type": "1", "parent_station": ""}},
		{Name: "Type1Parent", Values: map[string]any{"location_type": "1", "parent_station": "station"}},
		{Name: "Type2Empty", Values: map[string]any{"location_type": "2", "parent_station": ""}, Count: 1},
		{Name: "Type2Parent", Values: map[string]any{"location_type": "2", "parent_station": "station"}},
		{Name: "Type3Empty", Values: map[string]any{"location_type": "3", "parent_station": ""}, Count: 1},
		{Name: "Type3Parent", Values: map[string]any{"location_type": "3", "parent_station": "station"}},
		{Name: "Type4Empty", Values: map[string]any{"location_type": "4", "parent_station": ""}, Count: 1},
		{Name: "Type4Parent", Values: map[string]any{"location_type": "4", "parent_station": "station"}},
		{Name: "TypeEmpty", Values: map[string]any{"location_type": "", "parent_station": ""}},
		{Name: "TypeParent", Values: map[string]any{"location_type": "", "parent_station": "station"}},
		{Name: "TypeNoneEmpty", Values: map[string]any{"location_type": nil, "parent_station": ""}},
		{Name: "TypeNoneParent", Values: map[string]any{"location_type": nil, "parent_station": "station"}},
		{Name: "MissingParentColumn", Values: map[string]any{"location_type": "2"}, Count: 1},
		{Name: "NullParent", Values: map[string]any{"location_type": "3", "parent_station": nil}, Count: 1},
		{Name: "MissingLocationColumn", Values: map[string]any{"parent_station": ""}},
		{Name: "MissingColumns", Values: map[string]any{}},
	})
}
