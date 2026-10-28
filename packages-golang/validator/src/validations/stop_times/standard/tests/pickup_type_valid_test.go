package stop_times_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/utils"
	"testing"
)

func TestPickupTypeValid(t *testing.T) {
	testutils.CheckCases(t, "stop_times_pickup_type_valid", "pickup_type", checks.PickupTypeValid, []testutils.Case{
		{Name: "Valid0", Values: map[string]any{"pickup_type": "0"}, Count: 0, WantError: false},
		{Name: "Valid1", Values: map[string]any{"pickup_type": "1"}, Count: 0, WantError: false},
		{Name: "Valid2", Values: map[string]any{"pickup_type": "2"}, Count: 0, WantError: false},
		{Name: "Valid3", Values: map[string]any{"pickup_type": "3"}, Count: 0, WantError: false},
		{Name: "Invalid0", Values: map[string]any{"pickup_type": "-1"}, Count: 1, WantError: false},
		{Name: "Invalid1", Values: map[string]any{"pickup_type": "4"}, Count: 1, WantError: false},
		{Name: "ParseError0", Values: map[string]any{"pickup_type": ""}, Count: 0, WantError: true},
		{Name: "ParseError1", Values: map[string]any{"pickup_type": "bad"}, Count: 0, WantError: true},
		{Name: "ParseError2", Values: map[string]any{"pickup_type": "1.5"}, Count: 0, WantError: true},
		{Name: "ParseError3", Values: map[string]any{"pickup_type": "999999999999999999999"}, Count: 0, WantError: true},
		{Name: "ParseError4", Values: map[string]any{"pickup_type": nil}, Count: 0, WantError: true},
		{Name: "MissingColumn", Values: map[string]any{}, WantError: true},
	})
}
