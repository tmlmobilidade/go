package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestTimepointValid(t *testing.T) {
	validationutils.StopTimesCheckCases(t, "stop_times_timepoint_valid", "timepoint", standard.TimepointValid, []validationutils.StopTimesCase{
		{Name: "Valid0", Values: map[string]any{"timepoint": "0"}, Count: 0, WantError: false},
		{Name: "Valid1", Values: map[string]any{"timepoint": "1"}, Count: 0, WantError: false},
		{Name: "Invalid0", Values: map[string]any{"timepoint": "2"}, Count: 1, WantError: false},
		{Name: "Invalid1", Values: map[string]any{"timepoint": "-1"}, Count: 1, WantError: false},
		{Name: "Invalid2", Values: map[string]any{"timepoint": "01"}, Count: 1, WantError: false},
		{Name: "Invalid3", Values: map[string]any{"timepoint": "1.0"}, Count: 1, WantError: false},
		{Name: "Invalid4", Values: map[string]any{"timepoint": "bad"}, Count: 1, WantError: false},
		{Name: "Invalid5", Values: map[string]any{"timepoint": ""}, Count: 1, WantError: false},
		{Name: "Invalid6", Values: map[string]any{"timepoint": nil}, Count: 1, WantError: false},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
