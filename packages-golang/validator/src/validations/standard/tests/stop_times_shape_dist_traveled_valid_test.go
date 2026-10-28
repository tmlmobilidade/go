package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopTimesShapeDistTraveledValid(t *testing.T) {
	validationutils.StopTimesCheckCases(t, "stop_times_shape_dist_traveled_valid", "shape_dist_traveled", standard.StopTimesShapeDistTraveledValid, []validationutils.StopTimesCase{
		{Name: "Valid0", Values: map[string]any{"shape_dist_traveled": "0"}, Count: 0, WantError: false},
		{Name: "Valid1", Values: map[string]any{"shape_dist_traveled": "0.001"}, Count: 0, WantError: false},
		{Name: "Valid2", Values: map[string]any{"shape_dist_traveled": "123.45"}, Count: 0, WantError: false},
		{Name: "Valid3", Values: map[string]any{"shape_dist_traveled": "1e3"}, Count: 0, WantError: false},
		{Name: "Invalid0", Values: map[string]any{"shape_dist_traveled": "-0.1"}, Count: 1, WantError: false},
		{Name: "Invalid1", Values: map[string]any{"shape_dist_traveled": "-1"}, Count: 1, WantError: false},
		{Name: "ParseError0", Values: map[string]any{"shape_dist_traveled": ""}, Count: 0, WantError: true},
		{Name: "ParseError1", Values: map[string]any{"shape_dist_traveled": "bad"}, Count: 0, WantError: true},
		{Name: "ParseError2", Values: map[string]any{"shape_dist_traveled": "1e999"}, Count: 0, WantError: true},
		{Name: "ParseError3", Values: map[string]any{"shape_dist_traveled": "1,5"}, Count: 0, WantError: true},
		{Name: "ParseError4", Values: map[string]any{"shape_dist_traveled": nil}, Count: 0, WantError: true},
		{Name: "MissingColumn", Values: map[string]any{}, WantError: true},
	})
}
