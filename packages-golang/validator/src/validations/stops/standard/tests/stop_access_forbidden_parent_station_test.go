package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestStopAccessForbiddenParentStation(t *testing.T) {
	testutils.CheckCases(t, "stops_stop_access_forbidden_parent_station", "stop_access", checks.StopAccessForbiddenParentStation, []testutils.Case{
		{Name: "HasParent", Values: map[string]any{"parent_station": "station", "stop_access": "1"}},
		{Name: "EmptyParent", Values: map[string]any{"parent_station": "", "stop_access": "1"}, Count: 1},
		{Name: "NullParent", Values: map[string]any{"parent_station": nil, "stop_access": "0"}, Count: 1},
		{Name: "MissingParent", Values: map[string]any{"stop_access": "1"}, Count: 1},
		{Name: "AbsentAccessStillChecksParent", Values: map[string]any{"parent_station": ""}, Count: 1},
	})
}
