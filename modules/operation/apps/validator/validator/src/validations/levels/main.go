package levels

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	levels_fields "main/validations/levels/fields/checks"
	levels_standard "main/validations/levels/standard/checks"
)

func init() { registry.RegisterWithTables("levels", RunValidations) }
func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "levels")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "levels", config.ProgressThresholdLarge)
	err = tables.ForEachRow("levels", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "levels.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"levels_level_id_field": func() {
				check("levels_level_id_field", levels_fields.LevelIdField(db, rules.Rule("levels_level_id_field")))
			},
			"levels_level_index_field": func() {
				check("levels_level_index_field", levels_fields.LevelIndexField(db, rules.Rule("levels_level_index_field")))
			},
			"levels_level_name_field": func() {
				check("levels_level_name_field", levels_fields.LevelNameField(db, rules.Rule("levels_level_name_field")))
			},
			"levels_level_id_unique": func() {
				check("levels_level_id_unique", levels_standard.LevelIdUnique(db, rules.Rule("levels_level_id_unique")))
			},
			"levels_level_index_valid": func() {
				check("levels_level_index_valid", levels_standard.LevelIndexValid(db, rules.Rule("levels_level_index_valid")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating levels: %v", err))
		return
	}
	lib.AppLogger.Info(fmt.Sprintf("Completed levels.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
