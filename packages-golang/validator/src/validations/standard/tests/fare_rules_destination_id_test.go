package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestDestinationIdValid(t *testing.T) {
	const id = "fare_rules_destination_id_foreign"
	for _, tc := range []struct {
		value any
		count int
	}{{"A", 0}, {"quoted'id", 0}, {"0", 0}, {"missing", 1}, {"stop-only", 1}, {"code-only", 1}, {"", 0}, {nil, 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FareRulesFixture(t, map[string]any{"destination_id": tc.value}, config)
			if err := standard.DestinationIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.FareRulesAssertFindings(t, id, "destination_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.FareRulesFixture(t, nil, config)
		if err := standard.DestinationIdForeign(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.FareRulesAssertFindings(t, id, "destination_id", types.SEVERITY_ERROR, 0)
	})
	validationutils.FareRulesCheckInvalid(t, id, "destination_id", standard.DestinationIdForeign, map[string]any{"destination_id": "missing"})
}
func TestDestinationIdLiveReference(t *testing.T) {
	const id = "fare_rules_destination_id_foreign"
	config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
	db, ctx := validationutils.FareRulesFixture(t, map[string]any{"destination_id": "A"}, config)
	if err := standard.DestinationIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.FareRulesAssertFindings(t, id, "destination_id", types.SEVERITY_ERROR, 0)
	if _, err := db.Exec("DELETE FROM stops WHERE zone_id='A'"); err != nil {
		t.Fatal(err)
	}
	if err := standard.DestinationIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.FareRulesAssertFindings(t, id, "destination_id", types.SEVERITY_ERROR, 1)
}
func TestDestinationIdMissingReferenceTable(t *testing.T) {
	const id = "fare_rules_destination_id_foreign"
	config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
	db, ctx := validationutils.FareRulesFixture(t, map[string]any{"destination_id": "A"}, config)
	if _, err := db.Exec("DROP TABLE stops"); err != nil {
		t.Fatal(err)
	}
	if err := standard.DestinationIdForeign(ctx, config.Rule(id)); err == nil {
		t.Fatal("SQLite error swallowed")
	}
	validationutils.FareRulesAssertFindings(t, id, "destination_id", types.SEVERITY_ERROR, 0)
}
