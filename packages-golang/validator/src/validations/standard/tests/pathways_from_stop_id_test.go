package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestPathwaysFromStopIdValid(t *testing.T) {
	const id = "pathways_from_stop_id_foreign"
	for _, tc := range []struct {
		value any
		count int
	}{{"A", 0}, {"missing", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.PathwaysFixture(t, map[string]any{"pathway_mode": "2", "from_stop_id": tc.value}, config)
			if err := standard.PathwaysFromStopIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.PathwaysAssertFindings(t, id, "from_stop_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.PathwaysFixture(t, nil, config)
		if err := standard.PathwaysFromStopIdForeign(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.PathwaysAssertFindings(t, id, "from_stop_id", types.SEVERITY_ERROR, 0)
	})
	validationutils.PathwaysCheckInvalid(t, id, "from_stop_id", standard.PathwaysFromStopIdForeign, map[string]any{"from_stop_id": "bad", "pathway_mode": "2"})
}
func TestFromStopIdStopAttributes(t *testing.T) {
	const id = "pathways_from_stop_id_foreign"
	for _, tc := range []struct {
		location, access string
		count            int
	}{
		{"", "", 0}, {"0", "0", 0}, {"1", "0", 1}, {"2", "1", 0}, {"3", "bad", 0}, {"4", "0", 0}, {"5", "0", 1}, {"0", "1", 1}, {"bad", "0", 1}, {"0", "bad", 1},
	} {
		t.Run(tc.location+"/"+tc.access, func(t *testing.T) {
			config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
			db, ctx := validationutils.PathwaysFixture(t, map[string]any{"from_stop_id": "A"}, config)
			if _, err := db.Exec("UPDATE stops SET location_type=?,stop_access=?", tc.location, tc.access); err != nil {
				t.Fatal(err)
			}
			if err := standard.PathwaysFromStopIdForeign(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.PathwaysAssertFindings(t, id, "from_stop_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingStopsTable", func(t *testing.T) {
		config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
		db, ctx := validationutils.PathwaysFixture(t, map[string]any{"from_stop_id": "A"}, config)
		if _, err := db.Exec("DROP TABLE stops"); err != nil {
			t.Fatal(err)
		}
		if err := standard.PathwaysFromStopIdForeign(ctx, config.Rule(id)); err == nil {
			t.Fatal("SQLite failure swallowed")
		}
	})
}
