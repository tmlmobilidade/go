package stops

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/stops/validations"
)

func init() {
	registry.Register("stops", RunValidations)

}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.StopsRules
	if rules != nil {
		section = &rules.Stops
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Validations for stops.txt")

	// stopsData := BuildStopsDataCache()
	// if stopsData == nil {
	// 	lib.AppLogger.Error("Error pre-computing stops data cache")
	// 	return
	// }
	// lib.AppLogger.Debug(fmt.Sprintf("Pre-computed stops data cache for %d stops", len(stopsData.ByStopID)))

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
		// validations.StopIdValidation(&stop, row, &gtfs, stopRules, stopsData)
		runner.Run(services.RuleActions{
			"stop_id_unique":                                   func() { validations.StopIdValidation(&stop, row, &gtfs, stopRules) },
			"stop_code_valid":                                  func() { validations.StopCodeValidation(&stop, row, &gtfs, stopRules) },
			"stop_name_required_by_location_type":              func() { validations.StopNameValidation(&stop, row, stopRules) },
			"stops_tts_stop_name_valid":                        func() { validations.TtsStopNameValidation(&stop, row, stopRules) },
			"stop_desc_valid":                                  func() { validations.StopDescValidation(&stop, row, stopRules) },
			"stop_lat_valid_latitude_range":                    func() { validations.StopLatValidation(&stop, row, stopRules) },
			"stop_lon_valid_longitude_range":                   func() { validations.StopLonValidation(&stop, row, stopRules) },
			"stops_zone_id_valid":                              func() { validations.ZoneIdValidation(&stop, row, stopRules) },
			"stops_location_type_valid_enum":                   func() { validations.LocationTypeValidation(&stop, row, stopRules) },
			"stops_parent_station_id_valid_for_stop_hierarchy": func() { validations.ParentStationValidation(&stop, row, gtfs, stopRules) },
			"stop_timezone_valid":                              func() { validations.StopTimezoneValidation(&stop, row, stopRules) },
			"stops_wheelchair_boarding_valid_enum":             func() { validations.WheelchairBoardingValidation(&stop, row, stopRules) },
			"stops_level_id_valid_id":                          func() { validations.LevelIdValidation(&stop, row, gtfs, stopRules) },
			"stops_platform_code_valid":                        func() { validations.PlatformCodeValidation(&stop, row, stopRules) },
			"stops_region_id_valid":                            func() { validations.RegionIdValidation(&stop, row, stopRules) },
			"stops_public_visible_valid_enum":                  func() { validations.PublicVisibleValidation(&stop, row, stopRules) },
			"stops_shelter_code_valid":                         func() { validations.ShelterCodeValidation(&stop, row, stopRules) },
			"stops_shelter_maintainer_valid":                   func() { validations.ShelterMaintainerValidation(&stop, row, stopRules) },
			"stop_short_name_valid":                            func() { validations.StopShortNameValidation(&stop, row, stopRules) },
			"stop_url_valid_url":                               func() { validations.StopUrlValidation(&stop, row, stopRules) },
			"stops_municipality_id_valid":                      func() { validations.MunicipalityIdValidation(&stop, row, stopRules) },
			"stops_parish_id_valid":                            func() { validations.ParishIdValidation(&stop, row, stopRules) },
			"stops_has_bench_valid_enum":                       func() { validations.HasBenchValidation(&stop, row, stopRules) },
			"stops_has_network_map_valid_enum":                 func() { validations.HasNetworkMapValidation(&stop, row, stopRules) },
			"stops_has_pip_real_time_valid_enum":               func() { validations.HasPipRealTimeValidation(&stop, row, stopRules) },
			"stops_has_schedules_valid_enum":                   func() { validations.HasSchedulesValidation(&stop, row, stopRules) },
			"stops_has_shelter_valid_enum":                     func() { validations.HasShelterValidation(&stop, row, stopRules) },
			"stops_has_stop_sign_valid_enum":                   func() { validations.HasStopSignValidation(&stop, row, stopRules) },
			"stops_has_tariffs_information_valid_enum":         func() { validations.HasTariffsInformationValidation(&stop, row, stopRules) },
			"stop_access_validation":                           func() { validations.StopAccessValidation(&stop, row, &gtfs, stopRules) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating stops: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed stops.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
