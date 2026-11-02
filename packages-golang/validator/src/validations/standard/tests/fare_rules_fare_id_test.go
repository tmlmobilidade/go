package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestFareIdValid(t *testing.T) {
	const id = "fare_rules_fare_id_foreign"
	for _, tc := range []struct {
		value any
		count int
	}{{"A", 0}, {"quoted'id", 0}, {"0", 0}, {"missing", 1}, {"stop-only", 1}, {"code-only", 1}, {"", 0}, {nil, 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FareRulesFixture(t, map[string]any{"fare_id": tc.value}, config)
			if err := standard.FareIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.FareRulesAssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.FareRulesFixture(t, nil, config)
		if err := standard.FareIdForeign(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.FareRulesAssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, 0)
	})
	validationutils.FareRulesCheckInvalid(t, id, "fare_id", standard.FareIdForeign, map[string]any{"fare_id": "missing"})
}
func TestFareIdLiveReference(t *testing.T) {
	const id = "fare_rules_fare_id_foreign"
	config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
	db, ctx := validationutils.FareRulesFixture(t, map[string]any{"fare_id": "A"}, config)
	if err := standard.FareIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.FareRulesAssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, 0)
	if _, err := db.Exec("DELETE FROM fare_attributes WHERE fare_id='A'"); err != nil {
		t.Fatal(err)
	}
	if err := standard.FareIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.FareRulesAssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, 1)
}
func TestFareIdMissingReferenceTable(t *testing.T) {
	const id = "fare_rules_fare_id_foreign"
	config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
	db, ctx := validationutils.FareRulesFixture(t, map[string]any{"fare_id": "A"}, config)
	if _, err := db.Exec("DROP TABLE fare_attributes"); err != nil {
		t.Fatal(err)
	}
	if err := standard.FareIdForeign(ctx, config.Rule(id)); err == nil {
		t.Fatal("SQLite error swallowed")
	}
	validationutils.FareRulesAssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, 0)
}
