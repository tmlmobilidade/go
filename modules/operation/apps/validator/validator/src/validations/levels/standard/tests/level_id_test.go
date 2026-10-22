package levels_standard_test

import (
	"main/services"
	"main/types"
	checks "main/validations/levels/standard/checks"
	testutils "main/validations/levels/utils"
	"testing"
)

func TestLevelIdUnique(t *testing.T) {
	const id = "levels_level_id_unique"
	for _, tc := range []struct {
		name  string
		value any
		other any
		count int
	}{
		{"Unique", "A", "B", 0}, {"Duplicate", "A", "A", 1}, {"Quoted", "rider'quoted", "rider'quoted", 1}, {"Empty", "", "", 0}, {"Null", nil, nil, 0}} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			db, ctx := testutils.Fixture(t, map[string]any{"level_id": tc.value}, config)
			if _, err := db.Exec("INSERT INTO levels(level_id) VALUES (?)", tc.other); err != nil {
				t.Fatal(err)
			}
			if err := checks.LevelIdUnique(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "level_id", types.SEVERITY_ERROR, tc.count)
			services.AppMessageService.Clear()
			if _, err := db.Exec("UPDATE levels SET level_id='changed' WHERE rowid=4"); err != nil {
				t.Fatal(err)
			}
			if err := checks.LevelIdUnique(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "level_id", types.SEVERITY_ERROR, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { testutils.AssertReadFailure(t, checks.LevelIdUnique, id) })
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.LevelIdUnique(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "level_id", types.SEVERITY_ERROR, 0)
	})
}
