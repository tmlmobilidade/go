package fare_rules_standard_test

import (
	"fmt"
	"main/types"
	checks "main/validations/fare_rules/standard/checks"
	testutils "main/validations/fare_rules/utils"
	"testing"
)

func TestRouteIdValid(t *testing.T) {
	const id = "fare_rules_route_id_foreign"
	for _, tc := range []struct {
		value any
		count int
	}{{"A", 0}, {"quoted'id", 0}, {"0", 0}, {"missing", 1}, {"stop-only", 1}, {"code-only", 1}, {"", 0}, {nil, 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"route_id": tc.value}, config)
			if err := checks.RouteIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "route_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.RouteIdForeign(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "route_id", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "route_id", checks.RouteIdForeign, map[string]any{"route_id": "missing"})
}
func TestRouteIdLiveReference(t *testing.T) {
	const id = "fare_rules_route_id_foreign"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	db, ctx := testutils.Fixture(t, map[string]any{"route_id": "A"}, config)
	if err := checks.RouteIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "route_id", types.SEVERITY_ERROR, 0)
	if _, err := db.Exec("DELETE FROM routes WHERE route_id='A'"); err != nil {
		t.Fatal(err)
	}
	if err := checks.RouteIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "route_id", types.SEVERITY_ERROR, 1)
}
func TestRouteIdMissingReferenceTable(t *testing.T) {
	const id = "fare_rules_route_id_foreign"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	db, ctx := testutils.Fixture(t, map[string]any{"route_id": "A"}, config)
	if _, err := db.Exec("DROP TABLE routes"); err != nil {
		t.Fatal(err)
	}
	if err := checks.RouteIdForeign(ctx, config.Rule(id)); err == nil {
		t.Fatal("SQLite error swallowed")
	}
	testutils.AssertFindings(t, id, "route_id", types.SEVERITY_ERROR, 0)
}
