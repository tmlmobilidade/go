package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestTripIdValid(t *testing.T) {
	const id = "frequencies_trip_id_foreign"
	for _, tc := range []struct {
		value any
		count int
	}{{"A", 0}, {"trip'quoted", 0}, {"missing", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.FrequenciesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FrequenciesFixture(t, map[string]any{"trip_id": tc.value}, config)
			if err := standard.FrequenciesTripIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.FrequenciesAssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.FrequenciesConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.FrequenciesFixture(t, nil, config)
		if err := standard.FrequenciesTripIdForeign(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.FrequenciesAssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, 0)
	})
	validationutils.FrequenciesCheckInvalid(t, id, "trip_id", standard.FrequenciesTripIdForeign, map[string]any{"trip_id": "bad"})
}
func TestTripReferenceReadsCurrentSQLite(t *testing.T) {
	const id = "frequencies_trip_id_foreign"
	config := validationutils.FrequenciesConfig(id, types.SEVERITY_ERROR)
	db, ctx := validationutils.FrequenciesFixture(t, map[string]any{"trip_id": "A"}, config)
	if err := standard.FrequenciesTripIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec("DELETE FROM trips"); err != nil {
		t.Fatal(err)
	}
	if err := standard.FrequenciesTripIdForeign(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.FrequenciesAssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, 1)
}
func TestMissingTripsTableReturnsError(t *testing.T) {
	const id = "frequencies_trip_id_foreign"
	config := validationutils.FrequenciesConfig(id, types.SEVERITY_ERROR)
	db, ctx := validationutils.FrequenciesFixture(t, map[string]any{"trip_id": "A"}, config)
	if _, err := db.Exec("DROP TABLE trips"); err != nil {
		t.Fatal(err)
	}
	if err := standard.FrequenciesTripIdForeign(ctx, config.Rule(id)); err == nil {
		t.Fatal("SQLite error swallowed")
	}
	validationutils.FrequenciesAssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, 0)
}
