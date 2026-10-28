package transfers

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/config"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	registry "github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	transfers_fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/transfers/fields/checks"
	transfers_standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/transfers/standard/checks"
	"main/types"
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
			"transfers_from_stop_id_foreign": func() {
				check("transfers_from_stop_id_foreign", transfers_standard.FromStopIdForeign(db, rules.Rule("transfers_from_stop_id_foreign")))
			},
			"transfers_from_route_id_foreign": func() {
				check("transfers_from_route_id_foreign", transfers_standard.FromRouteIdForeign(db, rules.Rule("transfers_from_route_id_foreign")))
			},
			"transfers_from_trip_id_foreign": func() {
				check("transfers_from_trip_id_foreign", transfers_standard.FromTripIdForeign(db, rules.Rule("transfers_from_trip_id_foreign")))
			},
			"transfers_to_stop_id_foreign": func() {
				check("transfers_to_stop_id_foreign", transfers_standard.ToStopIdForeign(db, rules.Rule("transfers_to_stop_id_foreign")))
			},
			"transfers_to_route_id_foreign": func() {
				check("transfers_to_route_id_foreign", transfers_standard.ToRouteIdForeign(db, rules.Rule("transfers_to_route_id_foreign")))
			},
			"transfers_to_trip_id_foreign": func() {
				check("transfers_to_trip_id_foreign", transfers_standard.ToTripIdForeign(db, rules.Rule("transfers_to_trip_id_foreign")))
			},
			"transfers_transfer_type_valid": func() {
				check("transfers_transfer_type_valid", transfers_standard.TransferTypeValid(db, rules.Rule("transfers_transfer_type_valid")))
			},
			"transfers_min_transfer_time_valid": func() {
				check("transfers_min_transfer_time_valid", transfers_standard.MinTransferTimeValid(db, rules.Rule("transfers_min_transfer_time_valid")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating transfers: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed transfers.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
