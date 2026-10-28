package routes_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/routes/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/routes/utils"
	"main/types"
	"testing"
)

func TestRouteIdUnique(t *testing.T) {
	const id = "routes_route_id_unique"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{{"Unique", map[string]any{"route_id": "R1"}, 0},
		{"Duplicate", map[string]any{"route_id": "R1"}, 1},
		{"DuplicateEmpty", map[string]any{"route_id": ""}, 1},
		{"Empty", map[string]any{"route_id": ""}, 0},
		{"Null", map[string]any{"route_id": nil}, 0},
		{"MissingColumn", map[string]any{}, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			connection, ctx := testutils.Fixture(t, tc.values, config)
			_ = connection
			if tc.name == "Duplicate" || tc.name == "DuplicateEmpty" {
				if _, err := connection.Exec("INSERT INTO routes (route_id) VALUES (?)", tc.values["route_id"]); err != nil {
					t.Fatal(err)
				}
			}
			if err := checks.RouteIdUnique(ctx, config.Rule("routes_route_id_unique")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "route_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { testutils.AssertReadFailure(t, checks.RouteIdUnique, id) })
}

func TestRouteIdUniqueSeverity(t *testing.T) {
	const id = "routes_route_id_unique"
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_FORBIDDEN, types.SEVERITY_IGNORE, ""} {
		t.Run(string(severity), func(t *testing.T) {
			config := testutils.Config(id, severity)
			connection, ctx := testutils.Fixture(t, map[string]any{"route_id": "R1"}, config)
			if _, err := connection.Exec("INSERT INTO routes (route_id) VALUES ('R1')"); err != nil {
				t.Fatal(err)
			}
			if err := checks.RouteIdUnique(ctx, config.Rule("routes_route_id_unique")); err != nil {
				t.Fatal(err)
			}
			count := 1
			if severity == "" || severity == types.SEVERITY_IGNORE {
				count = 0
			}
			testutils.AssertFindings(t, id, "route_id", severity, count)
		})
	}
}
