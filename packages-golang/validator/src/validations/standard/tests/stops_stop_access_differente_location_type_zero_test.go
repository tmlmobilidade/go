package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopAccessDifferenteLocationTypeZero(t *testing.T) {
	validationutils.StopsCheckCases(t, "stops_stop_access_differente_location_type_zero", "stop_access", standard.StopAccessDifferenteLocationTypeZero, []validationutils.StopsCase{
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
