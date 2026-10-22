package transfers

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	transfers_fields "main/validations/transfers/fields/checks"
	transfers_standard "main/validations/transfers/standard/checks"
)

func init() { registry.RegisterWithTables("transfers", RunValidations) }
func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "transfers")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "transfers", config.ProgressThresholdLarge)
	err = tables.ForEachRow("transfers", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "transfers.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"transfers_from_stop_id_field": func() {
				check("transfers_from_stop_id_field", transfers_fields.FromStopIdField(db, rules.Rule("transfers_from_stop_id_field")))
			},
			"transfers_to_stop_id_field": func() {
				check("transfers_to_stop_id_field", transfers_fields.ToStopIdField(db, rules.Rule("transfers_to_stop_id_field")))
			},
			"transfers_from_route_id_field": func() {
				check("transfers_from_route_id_field", transfers_fields.FromRouteIdField(db, rules.Rule("transfers_from_route_id_field")))
			},
			"transfers_to_route_id_field": func() {
				check("transfers_to_route_id_field", transfers_fields.ToRouteIdField(db, rules.Rule("transfers_to_route_id_field")))
			},
			"transfers_from_trip_id_field": func() {
				check("transfers_from_trip_id_field", transfers_fields.FromTripIdField(db, rules.Rule("transfers_from_trip_id_field")))
			},
			"transfers_to_trip_id_field": func() {
				check("transfers_to_trip_id_field", transfers_fields.ToTripIdField(db, rules.Rule("transfers_to_trip_id_field")))
			},
			"transfers_transfer_type_field": func() {
				check("transfers_transfer_type_field", transfers_fields.TransferTypeField(db, rules.Rule("transfers_transfer_type_field")))
			},
			"transfers_min_transfer_time_field": func() {
				check("transfers_min_transfer_time_field", transfers_fields.MinTransferTimeField(db, rules.Rule("transfers_min_transfer_time_field")))
			},
			"transfer_from_stop_id_references_stops_table": func() {
				check("transfer_from_stop_id_references_stops_table", transfers_standard.FromStopIdValid(db, rules.Rule("transfer_from_stop_id_references_stops_table")))
			},
			"transfer_from_route_id_references_routes_table": func() {
				check("transfer_from_route_id_references_routes_table", transfers_standard.FromRouteIdValid(db, rules.Rule("transfer_from_route_id_references_routes_table")))
			},
			"transfer_from_trip_id_references_trips_table": func() {
				check("transfer_from_trip_id_references_trips_table", transfers_standard.FromTripIdValid(db, rules.Rule("transfer_from_trip_id_references_trips_table")))
			},
			"transfer_to_stop_id_references_stops_table": func() {
				check("transfer_to_stop_id_references_stops_table", transfers_standard.ToStopIdValid(db, rules.Rule("transfer_to_stop_id_references_stops_table")))
			},
			"transfer_to_route_id_references_routes_table": func() {
				check("transfer_to_route_id_references_routes_table", transfers_standard.ToRouteIdValid(db, rules.Rule("transfer_to_route_id_references_routes_table")))
			},
			"transfer_to_trip_id_references_trips_table": func() {
				check("transfer_to_trip_id_references_trips_table", transfers_standard.ToTripIdValid(db, rules.Rule("transfer_to_trip_id_references_trips_table")))
			},
			"transfer_type_valid_gtfs_enum": func() {
				check("transfer_type_valid_gtfs_enum", transfers_standard.TransferTypeValid(db, rules.Rule("transfer_type_valid_gtfs_enum")))
			},
			"transfers_min_transfer_time_non_negative_seconds": func() {
				check("transfers_min_transfer_time_non_negative_seconds", transfers_standard.MinTransferTimeValid(db, rules.Rule("transfers_min_transfer_time_non_negative_seconds")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating transfers: %v", err))
		return
	}
	lib.AppLogger.Info(fmt.Sprintf("Completed transfers.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
