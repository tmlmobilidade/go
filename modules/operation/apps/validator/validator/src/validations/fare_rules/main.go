package fare_rules

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	fare_rules_fields "main/validations/fare_rules/fields/checks"
	fare_rules_standard "main/validations/fare_rules/standard/checks"
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
			"fare_rule_fare_id_references_fare_attributes": func() {
				check("fare_rule_fare_id_references_fare_attributes", fare_rules_standard.FareIdValid(db, rules.Rule("fare_rule_fare_id_references_fare_attributes")))
			},
			"fare_rule_route_id_references_routes": func() {
				check("fare_rule_route_id_references_routes", fare_rules_standard.RouteIdValid(db, rules.Rule("fare_rule_route_id_references_routes")))
			},
			"fare_rule_origin_id_references_zones_stops": func() {
				check("fare_rule_origin_id_references_zones_stops", fare_rules_standard.OriginIdValid(db, rules.Rule("fare_rule_origin_id_references_zones_stops")))
			},
			"fare_rule_destination_id_references_zones_stops": func() {
				check("fare_rule_destination_id_references_zones_stops", fare_rules_standard.DestinationIdValid(db, rules.Rule("fare_rule_destination_id_references_zones_stops")))
			},
			"fare_rule_contains_id_references_zones_stops": func() {
				check("fare_rule_contains_id_references_zones_stops", fare_rules_standard.ContainsIdValid(db, rules.Rule("fare_rule_contains_id_references_zones_stops")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating fare_rules: %v", err))
		return
	}
	lib.AppLogger.Info(fmt.Sprintf("Completed fare_rules.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
