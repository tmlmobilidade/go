package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestHasSchedulesAllowed(t *testing.T) {
	options := func(values ...string) *[]string { return &values }
	validationutils.StopsCheckCases(t, "stops_has_schedules_allowed", "has_schedules", standard.HasSchedulesAllowed, []validationutils.StopsCase{
		{Name: "NoOptions", Values: map[string]any{"has_schedules": "unexpected"}, Options: nil},
		{Name: "EmptyOptions", Values: map[string]any{"has_schedules": "value"}, Count: 1, Options: options()},
		{Name: "Allowed", Values: map[string]any{"has_schedules": "value"}, Options: options("value", "other")},
		{Name: "Denied", Values: map[string]any{"has_schedules": "absent"}, Count: 1, Options: options("value")},
		{Name: "CaseSensitive", Values: map[string]any{"has_schedules": "VALUE"}, Count: 1, Options: options("value")},
		{Name: "Whitespace", Values: map[string]any{"has_schedules": " value "}, Count: 1, Options: options("value")},
		{Name: "Wildcard", Values: map[string]any{"has_schedules": "anything"}, Options: options(types.ALL_OPTIONS)},
		{Name: "WildcardMixed", Values: map[string]any{"has_schedules": "anything"}, Options: options("other", types.ALL_OPTIONS)},
		{Name: "EmptyAllowed", Values: map[string]any{"has_schedules": ""}, Options: options("")},
		{Name: "EmptyDenied", Values: map[string]any{"has_schedules": ""}, Count: 1, Options: options("value")},
		{Name: "NullDenied", Values: map[string]any{"has_schedules": nil}, Count: 1, Options: options("value")},
		{Name: "QuotedValue", Values: map[string]any{"has_schedules": "O'Brien"}, Options: options("O'Brien")},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1, Options: options("value")},
	})
}
