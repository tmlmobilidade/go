package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestRouteIdValid(t *testing.T) {
	const id = "fare_rules_route_id_foreign"
	for _, tc := range []struct {
		value any
		count int
	}{{"A", 0}, {"quoted'id", 0}, {"0", 0}, {"missing", 1}, {"stop-only", 1}, {"code-only", 1}, {"", 0}, {nil, 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FareRulesFixture(t, map[string]any{"route_id": tc.value}, config)
			if err := standard.FareRulesRouteIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.FareRulesAssertFindings(t, id, "route_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.FareRulesFixture(t, nil, config)
		if err := standard.FareRulesRouteIdForeign(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.FareRulesAssertFindings(t, id, "route_id", types.SEVERITY_ERROR, 0)
	})
	validationutils.FareRulesCheckInvalid(t, id, "route_id", standard.FareRulesRouteIdForeign, map[string]any{"route_id": "missing"})
}
func TestRouteIdLiveReference(t *testing.T) {
	const id = "fare_rules_route_id_foreign"
	config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
	db, ctx := validationutils.FareRulesFixture(t, map[string]any{"route_id": "A"}, config)
	if err := standard.FareRulesRouteIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.FareRulesAssertFindings(t, id, "route_id", types.SEVERITY_ERROR, 0)
	if _, err := db.Exec("DELETE FROM routes WHERE route_id='A'"); err != nil {
		t.Fatal(err)
	}
	if err := standard.FareRulesRouteIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.FareRulesAssertFindings(t, id, "route_id", types.SEVERITY_ERROR, 1)
}
func TestRouteIdMissingReferenceTable(t *testing.T) {
	const id = "fare_rules_route_id_foreign"
	config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
	db, ctx := validationutils.FareRulesFixture(t, map[string]any{"route_id": "A"}, config)
	if _, err := db.Exec("DROP TABLE routes"); err != nil {
		t.Fatal(err)
	}
	if err := standard.FareRulesRouteIdForeign(ctx, config.Rule(id)); err == nil {
		t.Fatal("SQLite error swallowed")
	}
	validationutils.FareRulesAssertFindings(t, id, "route_id", types.SEVERITY_ERROR, 0)
}
