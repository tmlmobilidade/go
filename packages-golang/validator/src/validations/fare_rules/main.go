package fare_rules

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/config"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	registry "github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	fare_rules_fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_rules/fields/checks"
	fare_rules_standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_rules/standard/checks"
	"main/types"
)

func init() { registry.RegisterWithTables("fare_rules", RunValidations) }
func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "fare_rules")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "fare_rules", config.ProgressThresholdSmall)
	err = tables.ForEachRow("fare_rules", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "fare_rules.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"fare_rules_fare_id_field": func() {
				check("fare_rules_fare_id_field", fare_rules_fields.FareIdField(db, rules.Rule("fare_rules_fare_id_field")))
			},
			"fare_rules_route_id_field": func() {
				check("fare_rules_route_id_field", fare_rules_fields.RouteIdField(db, rules.Rule("fare_rules_route_id_field")))
			},
			"fare_rules_origin_id_field": func() {
				check("fare_rules_origin_id_field", fare_rules_fields.OriginIdField(db, rules.Rule("fare_rules_origin_id_field")))
			},
			"fare_rules_destination_id_field": func() {
				check("fare_rules_destination_id_field", fare_rules_fields.DestinationIdField(db, rules.Rule("fare_rules_destination_id_field")))
			},
			"fare_rules_contains_id_field": func() {
				check("fare_rules_contains_id_field", fare_rules_fields.ContainsIdField(db, rules.Rule("fare_rules_contains_id_field")))
			},
			"fare_rules_fare_id_foreign": func() {
				check("fare_rules_fare_id_foreign", fare_rules_standard.FareIdForeign(db, rules.Rule("fare_rules_fare_id_foreign")))
			},
			"fare_rules_route_id_foreign": func() {
				check("fare_rules_route_id_foreign", fare_rules_standard.RouteIdForeign(db, rules.Rule("fare_rules_route_id_foreign")))
			},
			"fare_rules_origin_id_foreign": func() {
				check("fare_rules_origin_id_foreign", fare_rules_standard.OriginIdForeign(db, rules.Rule("fare_rules_origin_id_foreign")))
			},
			"fare_rules_destination_id_foreign": func() {
				check("fare_rules_destination_id_foreign", fare_rules_standard.DestinationIdForeign(db, rules.Rule("fare_rules_destination_id_foreign")))
			},
			"fare_rules_contains_id_foreign": func() {
				check("fare_rules_contains_id_foreign", fare_rules_standard.ContainsIdForeign(db, rules.Rule("fare_rules_contains_id_foreign")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating fare_rules: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed fare_rules.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
