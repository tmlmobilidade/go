package routes_custom_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/routes/custom/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/routes/utils"
	"main/types"
	"testing"
)

func TestPathTypeValid(t *testing.T) {
	const id = "routes_path_type_valid"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Allowed1", map[string]any{"path_type": "1"}, 0},
		{"Allowed2", map[string]any{"path_type": "2"}, 0},
		{"Allowed3", map[string]any{"path_type": "3"}, 0},
		{"Invalid0", map[string]any{"path_type": "0"}, 1},
		{"Invalid-1", map[string]any{"path_type": "-1"}, 1},
		{"Invalid13", map[string]any{"path_type": "13"}, 1},
		{"Invalid1.0", map[string]any{"path_type": "1.0"}, 1},
		{"Invalid 1", map[string]any{"path_type": " 1"}, 1},
		{"Invalidtext", map[string]any{"path_type": "text"}, 1},
		{"Empty", map[string]any{"path_type": ""}, 1},
		{"Null", map[string]any{"path_type": nil}, 1},
		{"MissingColumn", map[string]any{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, tc.values, config)

			if err := checks.PathTypeValid(ctx, config.Rule("routes_path_type_valid")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "path_type", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "path_type", checks.PathTypeValid, map[string]any{"path_type": "invalid"})
}
