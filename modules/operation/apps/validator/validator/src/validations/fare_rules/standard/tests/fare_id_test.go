package fare_rules_standard_test

import (
	"fmt"
	"main/types"
	checks "main/validations/fare_rules/standard/checks"
	testutils "main/validations/fare_rules/utils"
	"testing"
)

func TestFareIdValid(t *testing.T) {
	const id = "fare_rules_fare_id_foreign"
	for _, tc := range []struct {
		value any
		count int
	}{{"A", 0}, {"quoted'id", 0}, {"0", 0}, {"missing", 1}, {"stop-only", 1}, {"code-only", 1}, {"", 0}, {nil, 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"fare_id": tc.value}, config)
			if err := checks.FareIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.FareIdForeign(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "fare_id", checks.FareIdForeign, map[string]any{"fare_id": "missing"})
}
func TestFareIdLiveReference(t *testing.T) {
	const id = "fare_rules_fare_id_foreign"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	db, ctx := testutils.Fixture(t, map[string]any{"fare_id": "A"}, config)
	if err := checks.FareIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, 0)
	if _, err := db.Exec("DELETE FROM fare_attributes WHERE fare_id='A'"); err != nil {
		t.Fatal(err)
	}
	if err := checks.FareIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, 1)
}
func TestFareIdMissingReferenceTable(t *testing.T) {
	const id = "fare_rules_fare_id_foreign"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	db, ctx := testutils.Fixture(t, map[string]any{"fare_id": "A"}, config)
	if _, err := db.Exec("DROP TABLE fare_attributes"); err != nil {
		t.Fatal(err)
	}
	if err := checks.FareIdForeign(ctx, config.Rule(id)); err == nil {
		t.Fatal("SQLite error swallowed")
	}
	testutils.AssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, 0)
}
