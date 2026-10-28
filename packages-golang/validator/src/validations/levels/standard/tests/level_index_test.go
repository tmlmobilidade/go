package levels_standard_test

import (
	"fmt"
	"main/services"
	"main/types"
	checks "main/validations/levels/standard/checks"
	testutils "main/validations/levels/utils"
	"testing"
)

func TestLevelIndexValid(t *testing.T) {
	const id = "levels_level_index_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"-0", 0}, {"1.5", 0}, {"1e2", 0}, {"-1", 1}, {"-0.5", 1}, {"bad", 1}, {"1e50", 1}, {"", 0}, {nil, 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"level_index": tc.value}, config)
			if err := checks.LevelIndexValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "level_index", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.LevelIndexValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "level_index", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "level_index", checks.LevelIndexValid, map[string]any{"level_index": "bad"})
}
func TestLevelIndexReadsCurrentSQLite(t *testing.T) {
	const id = "levels_level_index_valid"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	db, ctx := testutils.Fixture(t, map[string]any{"level_index": "-1"}, config)
	if err := checks.LevelIndexValid(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "level_index", types.SEVERITY_ERROR, 1)
	services.AppMessageService.Clear()
	if _, err := db.Exec("UPDATE levels SET level_index='2.5'"); err != nil {
		t.Fatal(err)
	}
	if err := checks.LevelIndexValid(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "level_index", types.SEVERITY_ERROR, 0)
}
