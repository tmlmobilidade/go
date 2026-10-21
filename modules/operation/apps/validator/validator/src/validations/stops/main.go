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
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "stops")
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

		// Validate stop_id
		// validations.StopIdValidation(&stop, row, &gtfs, rules, stopsData)
		runner.Run(services.RuleActions{
			"stop_id_unique":  func() { validations.StopIdValidation(&stop, row, &gtfs, rules.Rule("stop_id_unique")) },
			"stop_code_valid": func() { validations.StopCodeValidation(&stop, row, &gtfs, rules.Rule("stop_code_valid")) },
			"stop_name_required_by_location_type": func() {
				validations.StopNameValidation(&stop, row, rules.Rule("stop_name_required_by_location_type"))
			},
			"stops_tts_stop_name_valid":      func() { validations.TtsStopNameValidation(&stop, row, rules.Rule("stops_tts_stop_name_valid")) },
			"stop_desc_valid":                func() { validations.StopDescValidation(&stop, row, rules.Rule("stop_desc_valid")) },
			"stop_lat_valid_latitude_range":  func() { validations.StopLatValidation(&stop, row, rules.Rule("stop_lat_valid_latitude_range")) },
			"stop_lon_valid_longitude_range": func() { validations.StopLonValidation(&stop, row, rules.Rule("stop_lon_valid_longitude_range")) },
			"stops_zone_id_valid":            func() { validations.ZoneIdValidation(&stop, row, rules.Rule("stops_zone_id_valid")) },
			"stops_location_type_valid_enum": func() {
				validations.LocationTypeValidation(&stop, row, rules.Rule("stops_location_type_valid_enum"))
			},
			"stops_parent_station_id_valid_for_stop_hierarchy": func() {
				validations.ParentStationValidation(&stop, row, gtfs, rules.Rule("stops_parent_station_id_valid_for_stop_hierarchy"))
			},
			"stop_timezone_valid": func() { validations.StopTimezoneValidation(&stop, row, rules.Rule("stop_timezone_valid")) },
			"stops_wheelchair_boarding_valid_enum": func() {
				validations.WheelchairBoardingValidation(&stop, row, rules.Rule("stops_wheelchair_boarding_valid_enum"))
			},
			"stops_level_id_valid_id":   func() { validations.LevelIdValidation(&stop, row, gtfs, rules.Rule("stops_level_id_valid_id")) },
			"stops_platform_code_valid": func() { validations.PlatformCodeValidation(&stop, row, rules.Rule("stops_platform_code_valid")) },
			"stops_region_id_valid":     func() { validations.RegionIdValidation(&stop, row, rules.Rule("stops_region_id_valid")) },
			"stops_public_visible_valid_enum": func() {
				validations.PublicVisibleValidation(&stop, row, rules.Rule("stops_public_visible_valid_enum"))
			},
			"stops_shelter_code_valid": func() { validations.ShelterCodeValidation(&stop, row, rules.Rule("stops_shelter_code_valid")) },
			"stops_shelter_maintainer_valid": func() {
				validations.ShelterMaintainerValidation(&stop, row, rules.Rule("stops_shelter_maintainer_valid"))
			},
			"stop_short_name_valid": func() { validations.StopShortNameValidation(&stop, row, rules.Rule("stop_short_name_valid")) },
			"stop_url_valid_url":    func() { validations.StopUrlValidation(&stop, row, rules.Rule("stop_url_valid_url")) },
			"stops_municipality_id_valid": func() {
				validations.MunicipalityIdValidation(&stop, row, rules.Rule("stops_municipality_id_valid"))
			},
			"stops_parish_id_valid":      func() { validations.ParishIdValidation(&stop, row, rules.Rule("stops_parish_id_valid")) },
			"stops_has_bench_valid_enum": func() { validations.HasBenchValidation(&stop, row, rules.Rule("stops_has_bench_valid_enum")) },
			"stops_has_network_map_valid_enum": func() {
				validations.HasNetworkMapValidation(&stop, row, rules.Rule("stops_has_network_map_valid_enum"))
			},
			"stops_has_pip_real_time_valid_enum": func() {
				validations.HasPipRealTimeValidation(&stop, row, rules.Rule("stops_has_pip_real_time_valid_enum"))
			},
			"stops_has_schedules_valid_enum": func() {
				validations.HasSchedulesValidation(&stop, row, rules.Rule("stops_has_schedules_valid_enum"))
			},
			"stops_has_shelter_valid_enum": func() { validations.HasShelterValidation(&stop, row, rules.Rule("stops_has_shelter_valid_enum")) },
			"stops_has_stop_sign_valid_enum": func() {
				validations.HasStopSignValidation(&stop, row, rules.Rule("stops_has_stop_sign_valid_enum"))
			},
			"stops_has_tariffs_information_valid_enum": func() {
				validations.HasTariffsInformationValidation(&stop, row, rules.Rule("stops_has_tariffs_information_valid_enum"))
			},
			"stop_access_validation": func() { validations.StopAccessValidation(&stop, row, &gtfs, rules.Rule("stop_access_validation")) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating stops: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed stops.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
