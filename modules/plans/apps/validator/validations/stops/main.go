package stops

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/stops/validations"
)

func init() {
	registry.Register("stops", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Validations for stops.txt")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "stops", config.ProgressThresholdLarge)

	err := gtfs.IterateStops(func(row int, rawStop types.StopRaw) error {
		tracker.Track()
		stop := validations.ParseStop(rawStop, row)

		if stop == (types.Stop{}) {
			return nil
		}

		var stopRules *types.StopsRules
		if rules != nil {
			stopRules = &rules.Stops
		}

		// Validate stop_id
		validations.StopIdValidation(&stop, row, &gtfs, stopRules)

		// Validate stop_code
		validations.StopCodeValidation(&stop, row, &gtfs, stopRules)

		// Validate stop_name
		validations.StopNameValidation(&stop, row, stopRules)

		// Validate tts_stop_name
		validations.TtsStopNameValidation(&stop, row, stopRules)

		// Validate stop_desc
		validations.StopDescValidation(&stop, row, stopRules)

		// Validate stop_lat
		validations.StopLatValidation(&stop, row, stopRules)

		// Validate stop_lon
		validations.StopLonValidation(&stop, row, stopRules)

		// Validate zone_id
		validations.ZoneIdValidation(&stop, row, stopRules)

		// Validate location_type
		validations.LocationTypeValidation(&stop, row, stopRules)

		// Validate parent_station
		validations.ParentStationValidation(&stop, row, gtfs, stopRules)

		// Validate stop_timezone
		validations.StopTimezoneValidation(&stop, row, stopRules)

		// Validate wheelchair_boarding
		validations.WheelchairBoardingValidation(&stop, row, stopRules)

		// Validate level_id
		validations.LevelIdValidation(&stop, row, gtfs, stopRules)

		// Validate platform_code
		validations.PlatformCodeValidation(&stop, row, stopRules)

		// Validate region_id
		validations.RegionIdValidation(&stop, row, stopRules)

		// Validate public_visible
		validations.PublicVisibleValidation(&stop, row, stopRules)

		// Validate shelter_code
		validations.ShelterCodeValidation(&stop, row, stopRules)

		// Validate shelter_maintainer
		validations.ShelterMaintainerValidation(&stop, row, stopRules)

		// Validate stop_short_name
		validations.StopShortNameValidation(&stop, row, stopRules)

		// Validate stop_url
		validations.StopUrlValidation(&stop, row, stopRules)

		// Validate municipality_id
		validations.MunicipalityIdValidation(&stop, row, stopRules)

		// Validate parish_id
		validations.ParishIdValidation(&stop, row, stopRules)

		// Validate has_bench
		validations.HasBenchValidation(&stop, row, stopRules)

		// Validate has_network_map
		validations.HasNetworkMapValidation(&stop, row, stopRules)

		// Validate has_pip_real_time
		validations.HasPipRealTimeValidation(&stop, row, stopRules)

		// Validate has_schedules
		validations.HasSchedulesValidation(&stop, row, stopRules)

		// Validate has_shelter
		validations.HasShelterValidation(&stop, row, stopRules)

		// Validate has_stop_sign
		validations.HasStopSignValidation(&stop, row, stopRules)

		// Validate has_tariffs_information
		validations.HasTariffsInformationValidation(&stop, row, stopRules)

		// Validate stop_access
		validations.StopAccessValidation(&stop, row, &gtfs, stopRules)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating stops: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed stops.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
