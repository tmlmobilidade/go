package standard_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
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
			config := validationutils.LevelsConfig(id, types.SEVERITY_ERROR)
			db, ctx := validationutils.LevelsFixture(t, map[string]any{"level_id": tc.value}, config)
			if _, err := db.Exec("INSERT INTO levels(level_id) VALUES (?)", tc.other); err != nil {
				t.Fatal(err)
			}
			if err := standard.LevelIdUnique(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.LevelsAssertFindings(t, id, "level_id", types.SEVERITY_ERROR, tc.count)
			services.AppMessageService.Clear()
			if _, err := db.Exec("UPDATE levels SET level_id='changed' WHERE rowid=4"); err != nil {
				t.Fatal(err)
			}
			if err := standard.LevelIdUnique(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.LevelsAssertFindings(t, id, "level_id", types.SEVERITY_ERROR, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { validationutils.LevelsAssertReadFailure(t, standard.LevelIdUnique, id) })
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.LevelsConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.LevelsFixture(t, nil, config)
		if err := standard.LevelIdUnique(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.LevelsAssertFindings(t, id, "level_id", types.SEVERITY_ERROR, 0)
	})
}
