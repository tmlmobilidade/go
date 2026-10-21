package stops_standard_test

import (
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestStopAccessDifferenteLocationTypeZero(t *testing.T) {
	testutils.CheckCases(t, "stops_stop_access_differente_location_type_zero", "stop_access", checks.StopAccessDifferenteLocationTypeZero, []testutils.Case{
		{Name: "Location0", Values: map[string]any{"location_type": "0", "stop_access": "value"}},
		{Name: "Location1", Values: map[string]any{"location_type": "1", "stop_access": "value"}, Count: 1},
		{Name: "Location2", Values: map[string]any{"location_type": "2", "stop_access": "value"}, Count: 1},
		{Name: "Location3", Values: map[string]any{"location_type": "3", "stop_access": "value"}, Count: 1},
		{Name: "Location4", Values: map[string]any{"location_type": "4", "stop_access": "value"}, Count: 1},
		{Name: "Location", Values: map[string]any{"location_type": "", "stop_access": "value"}, Count: 1},
		{Name: "LocationNone", Values: map[string]any{"location_type": nil, "stop_access": "value"}, Count: 1},
		{Name: "Location01", Values: map[string]any{"location_type": "01", "stop_access": "value"}, Count: 1},
		{Name: "Locationbad", Values: map[string]any{"location_type": "bad", "stop_access": "value"}, Count: 1},
		{Name: "MissingLocationType", Values: map[string]any{"stop_access": "value"}, Count: 1},
	})
}
