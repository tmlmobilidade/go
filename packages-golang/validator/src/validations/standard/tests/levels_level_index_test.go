package standard_test

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestLevelIndexValid(t *testing.T) {
	const id = "levels_level_index_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"-0", 0}, {"1.5", 0}, {"1e2", 0}, {"-1", 1}, {"-0.5", 1}, {"bad", 1}, {"1e50", 1}, {"", 0}, {nil, 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.LevelsConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.LevelsFixture(t, map[string]any{"level_index": tc.value}, config)
			if err := standard.LevelIndexValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.LevelsAssertFindings(t, id, "level_index", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.LevelsConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.LevelsFixture(t, nil, config)
		if err := standard.LevelIndexValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.LevelsAssertFindings(t, id, "level_index", types.SEVERITY_ERROR, 0)
	})
	validationutils.LevelsCheckInvalid(t, id, "level_index", standard.LevelIndexValid, map[string]any{"level_index": "bad"})
}
func TestLevelIndexReadsCurrentSQLite(t *testing.T) {
	const id = "levels_level_index_valid"
	config := validationutils.LevelsConfig(id, types.SEVERITY_ERROR)
	db, ctx := validationutils.LevelsFixture(t, map[string]any{"level_index": "-1"}, config)
	if err := standard.LevelIndexValid(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.LevelsAssertFindings(t, id, "level_index", types.SEVERITY_ERROR, 1)
	services.AppMessageService.Clear()
	if _, err := db.Exec("UPDATE levels SET level_index='2.5'"); err != nil {
		t.Fatal(err)
	}
	if err := standard.LevelIndexValid(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.LevelsAssertFindings(t, id, "level_index", types.SEVERITY_ERROR, 0)
}
