package fare_rules_standard_test

import (
	"fmt"
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_rules/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_rules/utils"
	"main/types"
	"testing"
)

func TestOriginIdValid(t *testing.T) {
	const id = "fare_rules_origin_id_foreign"
	for _, tc := range []struct {
		value any
		count int
	}{{"A", 0}, {"quoted'id", 0}, {"0", 0}, {"missing", 1}, {"stop-only", 1}, {"code-only", 1}, {"", 0}, {nil, 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"origin_id": tc.value}, config)
			if err := checks.OriginIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "origin_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.OriginIdForeign(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "origin_id", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "origin_id", checks.OriginIdForeign, map[string]any{"origin_id": "missing"})
}
func TestOriginIdLiveReference(t *testing.T) {
	const id = "fare_rules_origin_id_foreign"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	db, ctx := testutils.Fixture(t, map[string]any{"origin_id": "A"}, config)
	if err := checks.OriginIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "origin_id", types.SEVERITY_ERROR, 0)
	if _, err := db.Exec("DELETE FROM stops WHERE zone_id='A'"); err != nil {
		t.Fatal(err)
	}
	if err := checks.OriginIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "origin_id", types.SEVERITY_ERROR, 1)
}
func TestOriginIdMissingReferenceTable(t *testing.T) {
	const id = "fare_rules_origin_id_foreign"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	db, ctx := testutils.Fixture(t, map[string]any{"origin_id": "A"}, config)
	if _, err := db.Exec("DROP TABLE stops"); err != nil {
		t.Fatal(err)
	}
	if err := checks.OriginIdForeign(ctx, config.Rule(id)); err == nil {
		t.Fatal("SQLite error swallowed")
	}
	testutils.AssertFindings(t, id, "origin_id", types.SEVERITY_ERROR, 0)
}
