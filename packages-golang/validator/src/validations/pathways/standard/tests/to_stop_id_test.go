package pathways_standard_test

import (
	"fmt"
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/pathways/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/pathways/utils"
	"main/types"
	"testing"
)

func TestToStopIdValid(t *testing.T) {
	const id = "pathways_to_stop_id_foreign"
	for _, tc := range []struct {
		value any
		count int
	}{{"A", 0}, {"missing", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"pathway_mode": "2", "to_stop_id": tc.value}, config)
			if err := checks.ToStopIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "to_stop_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.ToStopIdForeign(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "to_stop_id", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "to_stop_id", checks.ToStopIdForeign, map[string]any{"to_stop_id": "bad", "pathway_mode": "2"})
}
func TestToStopIdStopAttributes(t *testing.T) {
	const id = "pathways_to_stop_id_foreign"
	for _, tc := range []struct {
		location, access string
		count            int
	}{
		{"", "", 0}, {"0", "0", 0}, {"1", "0", 1}, {"2", "1", 0}, {"3", "bad", 0}, {"4", "0", 0}, {"5", "0", 1}, {"0", "1", 1}, {"bad", "0", 0}, {"0", "bad", 0},
	} {
		t.Run(tc.location+"/"+tc.access, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			db, ctx := testutils.Fixture(t, map[string]any{"to_stop_id": "A"}, config)
			if _, err := db.Exec("UPDATE stops SET location_type=?,stop_access=?", tc.location, tc.access); err != nil {
				t.Fatal(err)
			}
			if err := checks.ToStopIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "to_stop_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingStopsTable", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		db, ctx := testutils.Fixture(t, map[string]any{"to_stop_id": "A"}, config)
		if _, err := db.Exec("DROP TABLE stops"); err != nil {
			t.Fatal(err)
		}
		if err := checks.ToStopIdForeign(ctx, config.Rule(id)); err == nil {
			t.Fatal("SQLite failure swallowed")
		}
	})
}
