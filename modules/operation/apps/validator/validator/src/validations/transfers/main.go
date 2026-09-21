package transfers

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/transfers/validations"
)

func init() {
	registry.Register("transfers", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
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
		validations.FromStopIdValidation(transfer, row, gtfs, &rules.Transfers)

		// Validate to_stop_id
		validations.ToStopIdValidation(transfer, row, gtfs, &rules.Transfers)

		// Validate from_route_id
		validations.FromRouteIdValidation(transfer, row, gtfs, &rules.Transfers)

		// Validate to_route_id
		validations.ToRouteIdValidation(transfer, row, gtfs, &rules.Transfers)

		// Validate from_trip_id
		validations.FromTripIdValidation(transfer, row, gtfs, &rules.Transfers)

		// Validate to_trip_id
		validations.ToTripIdValidation(transfer, row, gtfs, &rules.Transfers)

		// Validate transfer_type
		validations.TransferTypeValidation(transfer, row, &rules.Transfers)

		// Validate min_transfer_time
		validations.MinTransferTimeValidation(transfer, row, &rules.Transfers)

		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating transfers: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed transfers.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
