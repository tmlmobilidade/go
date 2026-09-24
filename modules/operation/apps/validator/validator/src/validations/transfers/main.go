package transfers

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/transfers/validations"
)

func init() {
	registry.Register("transfers", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.TransfersRules
	if rules != nil {
		section = &rules.Transfers
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Transfers Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "transfers", config.ProgressThresholdLarge)

	err := gtfs.IterateTransfers(func(row int, rawTransfers types.TransfersRaw) error {
		tracker.Track()
		transfer := validations.ParseTransfers(&rawTransfers, row, gtfs, &rules.Transfers)

		if transfer == nil {
			return nil
		}

		// Validate from_stop_id
		runner.Run(services.RuleActions{
			"transfer_from_stop_id_references_stops_table":   func() { validations.FromStopIdValidation(transfer, row, gtfs, &rules.Transfers) },
			"transfer_to_stop_id_references_stops_table":     func() { validations.ToStopIdValidation(transfer, row, gtfs, &rules.Transfers) },
			"transfer_from_route_id_references_routes_table": func() { validations.FromRouteIdValidation(transfer, row, gtfs, &rules.Transfers) },
			"transfer_to_route_id_references_routes_table":   func() { validations.ToRouteIdValidation(transfer, row, gtfs, &rules.Transfers) },
			"transfer_from_trip_id_references_trips_table":   func() { validations.FromTripIdValidation(transfer, row, gtfs, &rules.Transfers) },
			"transfer_to_trip_id_references_trips_table":     func() { validations.ToTripIdValidation(transfer, row, gtfs, &rules.Transfers) },
			"transfer_type_valid_gtfs_enum":                  func() { validations.TransferTypeValidation(transfer, row, &rules.Transfers) },
			"transfers_min_transfer_time_non_negative_seconds":         func() { validations.MinTransferTimeValidation(transfer, row, &rules.Transfers) },
		}, nil)

		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating transfers: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed transfers.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
