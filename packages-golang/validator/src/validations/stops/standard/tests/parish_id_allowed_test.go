package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"main/types"
	"testing"
)

func TestParishIdAllowed(t *testing.T) {
	options := func(values ...string) *[]string { return &values }
	testutils.CheckCases(t, "stops_parish_id_allowed", "parish_id", checks.ParishIdAllowed, []testutils.Case{
		{Name: "NoOptions", Values: map[string]any{"parish_id": "unexpected"}, Options: nil},
		{Name: "EmptyOptions", Values: map[string]any{"parish_id": "value"}, Count: 1, Options: options()},
		{Name: "Allowed", Values: map[string]any{"parish_id": "value"}, Options: options("value", "other")},
		{Name: "Denied", Values: map[string]any{"parish_id": "absent"}, Count: 1, Options: options("value")},
		{Name: "CaseSensitive", Values: map[string]any{"parish_id": "VALUE"}, Count: 1, Options: options("value")},
		{Name: "Whitespace", Values: map[string]any{"parish_id": " value "}, Count: 1, Options: options("value")},
		{Name: "Wildcard", Values: map[string]any{"parish_id": "anything"}, Options: options(types.ALL_OPTIONS)},
		{Name: "WildcardMixed", Values: map[string]any{"parish_id": "anything"}, Options: options("other", types.ALL_OPTIONS)},
		{Name: "EmptyAllowed", Values: map[string]any{"parish_id": ""}, Options: options("")},
		{Name: "EmptyDenied", Values: map[string]any{"parish_id": ""}, Count: 1, Options: options("value")},
		{Name: "NullDenied", Values: map[string]any{"parish_id": nil}, Count: 1, Options: options("value")},
		{Name: "QuotedValue", Values: map[string]any{"parish_id": "O'Brien"}, Options: options("O'Brien")},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1, Options: options("value")},
	})
}
