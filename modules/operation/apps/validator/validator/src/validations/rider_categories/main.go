package rider_categories

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	rider_categories_fields "main/validations/rider_categories/fields/checks"
	rider_categories_standard "main/validations/rider_categories/standard/checks"
)

func init() { registry.RegisterWithTables("rider_categories", RunValidations) }
func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "rider_categories")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "rider_categories", config.ProgressThresholdLarge)
	err = tables.ForEachRow("rider_categories", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "rider_categories.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"rider_categories_rider_category_id_field": func() {
				check("rider_categories_rider_category_id_field", rider_categories_fields.RiderCategoryIdField(db, rules.Rule("rider_categories_rider_category_id_field")))
			},
			"rider_categories_rider_category_name_field": func() {
				check("rider_categories_rider_category_name_field", rider_categories_fields.RiderCategoryNameField(db, rules.Rule("rider_categories_rider_category_name_field")))
			},
			"rider_categories_is_default_fare_category_field": func() {
				check("rider_categories_is_default_fare_category_field", rider_categories_fields.IsDefaultFareCategoryField(db, rules.Rule("rider_categories_is_default_fare_category_field")))
			},
			"rider_categories_eligibility_url_field": func() {
				check("rider_categories_eligibility_url_field", rider_categories_fields.EligibilityUrlField(db, rules.Rule("rider_categories_eligibility_url_field")))
			},
			"rider_category_id_unique": func() {
				check("rider_category_id_unique", rider_categories_standard.RiderCategoryIdUnique(db, rules.Rule("rider_category_id_unique")))
			},
			"rider_categories_at_most_one_default_fare_category": func() {
				check("rider_categories_at_most_one_default_fare_category", rider_categories_standard.IsDefaultFareCategoryValid(db, rules.Rule("rider_categories_at_most_one_default_fare_category")))
			},
			"rider_categories_eligibility_url_valid_http_url": func() {
				check("rider_categories_eligibility_url_valid_http_url", rider_categories_standard.EligibilityUrlValid(db, rules.Rule("rider_categories_eligibility_url_valid_http_url")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating rider_categories: %v", err))
		return
	}
	lib.AppLogger.Info(fmt.Sprintf("Completed rider_categories.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
