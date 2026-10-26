package stops

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	stops_fields "main/validations/stops/fields/checks"
	stops_standard "main/validations/stops/standard/checks"
)

func init() {
	registry.RegisterWithTables("stops", RunValidations)
}

func RunValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	lib.AppLogger.Debug("Running Validations for stops.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "stops", config.ProgressThresholdLarge)

	//
	// Create the rule runner

	runner, err := services.NewRuleRunner(gtfs, gtfsRules, "stops")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	//
	// Select the prepared stops table

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}
	table, err := tables.Table("stops")
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error opening stops table: %v", err))
		return
	}

	//
	// Iterate over stops table

	err = table.ForEachRow(func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "stops.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"stops_stop_id_field": func() {
				check("stops_stop_id_field", stops_fields.StopIdField(db, gtfsRules.Rule("stops_stop_id_field")))
			},
			"stops_stop_code_field": func() {
				check("stops_stop_code_field", stops_fields.StopCodeField(db, gtfsRules.Rule("stops_stop_code_field")))
			},
			"stops_stop_name_field": func() {
				check("stops_stop_name_field", stops_fields.StopNameField(db, gtfsRules.Rule("stops_stop_name_field")))
			},
			"stops_tts_stop_name_field": func() {
				check("stops_tts_stop_name_field", stops_fields.TtsStopNameField(db, gtfsRules.Rule("stops_tts_stop_name_field")))
			},
			"stops_stop_desc_field": func() {
				check("stops_stop_desc_field", stops_fields.StopDescField(db, gtfsRules.Rule("stops_stop_desc_field")))
			},
			"stops_stop_lat_field": func() {
				check("stops_stop_lat_field", stops_fields.StopLatField(db, gtfsRules.Rule("stops_stop_lat_field")))
			},
			"stops_stop_lon_field": func() {
				check("stops_stop_lon_field", stops_fields.StopLonField(db, gtfsRules.Rule("stops_stop_lon_field")))
			},
			"stops_zone_id_field": func() {
				check("stops_zone_id_field", stops_fields.ZoneIdField(db, gtfsRules.Rule("stops_zone_id_field")))
			},
			"stops_stop_url_field": func() {
				check("stops_stop_url_field", stops_fields.StopUrlField(db, gtfsRules.Rule("stops_stop_url_field")))
			},
			"stops_location_type_field": func() {
				check("stops_location_type_field", stops_fields.LocationTypeField(db, gtfsRules.Rule("stops_location_type_field")))
			},
			"stops_parent_station_field": func() {
				check("stops_parent_station_field", stops_fields.ParentStationField(db, gtfsRules.Rule("stops_parent_station_field")))
			},
			"stops_stop_timezone_field": func() {
				check("stops_stop_timezone_field", stops_fields.StopTimezoneField(db, gtfsRules.Rule("stops_stop_timezone_field")))
			},
			"stops_wheelchair_boarding_field": func() {
				check("stops_wheelchair_boarding_field", stops_fields.WheelchairBoardingField(db, gtfsRules.Rule("stops_wheelchair_boarding_field")))
			},
			"stops_level_id_field": func() {
				check("stops_level_id_field", stops_fields.LevelIdField(db, gtfsRules.Rule("stops_level_id_field")))
			},
			"stops_platform_code_field": func() {
				check("stops_platform_code_field", stops_fields.PlatformCodeField(db, gtfsRules.Rule("stops_platform_code_field")))
			},
			"stops_stop_access_field": func() {
				check("stops_stop_access_field", stops_fields.StopAccessField(db, gtfsRules.Rule("stops_stop_access_field")))
			},
			"stops_stop_short_name_field": func() {
				check("stops_stop_short_name_field", stops_fields.StopShortNameField(db, gtfsRules.Rule("stops_stop_short_name_field")))
			},
			"stops_region_id_field": func() {
				check("stops_region_id_field", stops_fields.RegionIdField(db, gtfsRules.Rule("stops_region_id_field")))
			},
			"stops_municipality_id_field": func() {
				check("stops_municipality_id_field", stops_fields.MunicipalityIdField(db, gtfsRules.Rule("stops_municipality_id_field")))
			},
			"stops_parish_id_field": func() {
				check("stops_parish_id_field", stops_fields.ParishIdField(db, gtfsRules.Rule("stops_parish_id_field")))
			},
			"stops_public_visible_field": func() {
				check("stops_public_visible_field", stops_fields.PublicVisibleField(db, gtfsRules.Rule("stops_public_visible_field")))
			},
			"stops_shelter_code_field": func() {
				check("stops_shelter_code_field", stops_fields.ShelterCodeField(db, gtfsRules.Rule("stops_shelter_code_field")))
			},
			"stops_shelter_maintainer_field": func() {
				check("stops_shelter_maintainer_field", stops_fields.ShelterMaintainerField(db, gtfsRules.Rule("stops_shelter_maintainer_field")))
			},
			"stops_has_bench_field": func() {
				check("stops_has_bench_field", stops_fields.HasBenchField(db, gtfsRules.Rule("stops_has_bench_field")))
			},
			"stops_has_network_map_field": func() {
				check("stops_has_network_map_field", stops_fields.HasNetworkMapField(db, gtfsRules.Rule("stops_has_network_map_field")))
			},
			"stops_has_pip_real_time_field": func() {
				check("stops_has_pip_real_time_field", stops_fields.HasPipRealTimeField(db, gtfsRules.Rule("stops_has_pip_real_time_field")))
			},
			"stops_has_schedules_field": func() {
				check("stops_has_schedules_field", stops_fields.HasSchedulesField(db, gtfsRules.Rule("stops_has_schedules_field")))
			},
			"stops_has_shelter_field": func() {
				check("stops_has_shelter_field", stops_fields.HasShelterField(db, gtfsRules.Rule("stops_has_shelter_field")))
			},
			"stops_has_stop_sign_field": func() {
				check("stops_has_stop_sign_field", stops_fields.HasStopSignField(db, gtfsRules.Rule("stops_has_stop_sign_field")))
			},
			"stops_has_tariffs_information_field": func() {
				check("stops_has_tariffs_information_field", stops_fields.HasTariffsInformationField(db, gtfsRules.Rule("stops_has_tariffs_information_field")))
			},

			//
			// Standard
			"stops_stop_id_unique": func() {
				check("stops_stop_id_unique", stops_standard.StopIdUnique(db, gtfsRules.Rule("stops_stop_id_unique")))
			},
			"stops_stop_code_unique": func() {
				check("stops_stop_code_unique", stops_standard.StopCodeUnique(db, gtfsRules.Rule("stops_stop_code_unique")))
			},
			"stops_stop_desc_different_stop_name": func() {
				check("stops_stop_desc_different_stop_name", stops_standard.StopDescDifferentStopName(db, gtfsRules.Rule("stops_stop_desc_different_stop_name")))
			},
			"stops_stop_lat_valid": func() {
				check("stops_stop_lat_valid", stops_standard.StopLatValid(db, gtfsRules.Rule("stops_stop_lat_valid")))
			},
			"stops_stop_lon_valid": func() {
				check("stops_stop_lon_valid", stops_standard.StopLonValid(db, gtfsRules.Rule("stops_stop_lon_valid")))
			},
			"stops_stop_url_valid": func() {
				check("stops_stop_url_valid", stops_standard.StopUrlValid(db, gtfsRules.Rule("stops_stop_url_valid")))
			},
			"stops_location_type_allowed": func() {
				check("stops_location_type_allowed", stops_standard.LocationTypeAllowed(db, gtfsRules.Rule("stops_location_type_allowed")))
			},
			"stops_location_type_valid": func() {
				check("stops_location_type_valid", stops_standard.LocationTypeValid(db, gtfsRules.Rule("stops_location_type_valid")))
			},
			"stops_parent_station_empty_location_types": func() {
				check("stops_parent_station_empty_location_types", stops_standard.ParentStationEmptyLocationTypes(db, gtfsRules.Rule("stops_parent_station_empty_location_types")))
			},
			"stops_parent_station_for_location_type_one": func() {
				check("stops_parent_station_for_location_type_one", stops_standard.ParentStationForLocationTypeOne(db, gtfsRules.Rule("stops_parent_station_for_location_type_one")))
			},
			"stops_parent_station_foreign": func() {
				check("stops_parent_station_foreign", stops_standard.ParentStationForeign(db, gtfsRules.Rule("stops_parent_station_foreign")))
			},
			"stops_stop_timezone_valid": func() {
				check("stops_stop_timezone_valid", stops_standard.StopTimezoneValid(db, gtfsRules.Rule("stops_stop_timezone_valid")))
			},
			"stops_wheelchair_boarding_allowed": func() {
				check("stops_wheelchair_boarding_allowed", stops_standard.WheelchairBoardingAllowed(db, gtfsRules.Rule("stops_wheelchair_boarding_allowed")))
			},
			"stops_wheelchair_boarding_valid": func() {
				check("stops_wheelchair_boarding_valid", stops_standard.WheelchairBoardingValid(db, gtfsRules.Rule("stops_wheelchair_boarding_valid")))
			},
			"stops_level_id_foreign": func() {
				check("stops_level_id_foreign", stops_standard.LevelIdForeign(db, gtfsRules.Rule("stops_level_id_foreign")))
			},
			"stops_platform_code_allowed": func() {
				check("stops_platform_code_allowed", stops_standard.PlatformCodeAllowed(db, gtfsRules.Rule("stops_platform_code_allowed")))
			},
			"stops_stop_access_differente_location_type_zero": func() {
				check("stops_stop_access_differente_location_type_zero", stops_standard.StopAccessDifferenteLocationTypeZero(db, gtfsRules.Rule("stops_stop_access_differente_location_type_zero")))
			},
			"stops_stop_access_forbidden_parent_station": func() {
				check("stops_stop_access_forbidden_parent_station", stops_standard.StopAccessForbiddenParentStation(db, gtfsRules.Rule("stops_stop_access_forbidden_parent_station")))
			},
			"stops_stop_access_valid": func() {
				check("stops_stop_access_valid", stops_standard.StopAccessValid(db, gtfsRules.Rule("stops_stop_access_valid")))
			},
			"stops_region_id_allowed": func() {
				check("stops_region_id_allowed", stops_standard.RegionIdAllowed(db, gtfsRules.Rule("stops_region_id_allowed")))
			},
			"stops_municipality_id_allowed": func() {
				check("stops_municipality_id_allowed", stops_standard.MunicipalityIdAllowed(db, gtfsRules.Rule("stops_municipality_id_allowed")))
			},
			"stops_parish_id_allowed": func() {
				check("stops_parish_id_allowed", stops_standard.ParishIdAllowed(db, gtfsRules.Rule("stops_parish_id_allowed")))
			},
			"stops_public_visible_valid": func() {
				check("stops_public_visible_valid", stops_standard.PublicVisibleValid(db, gtfsRules.Rule("stops_public_visible_valid")))
			},
			"stops_has_bench_allowed": func() {
				check("stops_has_bench_allowed", stops_standard.HasBenchAllowed(db, gtfsRules.Rule("stops_has_bench_allowed")))
			},
			"stops_has_bench_valid": func() {
				check("stops_has_bench_valid", stops_standard.HasBenchValid(db, gtfsRules.Rule("stops_has_bench_valid")))
			},
			"stops_has_network_map_allowed": func() {
				check("stops_has_network_map_allowed", stops_standard.HasNetworkMapAllowed(db, gtfsRules.Rule("stops_has_network_map_allowed")))
			},
			"stops_has_network_map_valid": func() {
				check("stops_has_network_map_valid", stops_standard.HasNetworkMapValid(db, gtfsRules.Rule("stops_has_network_map_valid")))
			},
			"stops_has_pip_real_time_allowed": func() {
				check("stops_has_pip_real_time_allowed", stops_standard.HasPipRealTimeAllowed(db, gtfsRules.Rule("stops_has_pip_real_time_allowed")))
			},
			"stops_has_pip_real_time_valid": func() {
				check("stops_has_pip_real_time_valid", stops_standard.HasPipRealTimeValid(db, gtfsRules.Rule("stops_has_pip_real_time_valid")))
			},
			"stops_has_schedules_allowed": func() {
				check("stops_has_schedules_allowed", stops_standard.HasSchedulesAllowed(db, gtfsRules.Rule("stops_has_schedules_allowed")))
			},
			"stops_has_schedules_valid": func() {
				check("stops_has_schedules_valid", stops_standard.HasSchedulesValid(db, gtfsRules.Rule("stops_has_schedules_valid")))
			},
			"stops_has_shelter_allowed": func() {
				check("stops_has_shelter_allowed", stops_standard.HasShelterAllowed(db, gtfsRules.Rule("stops_has_shelter_allowed")))
			},
			"stops_has_shelter_valid": func() {
				check("stops_has_shelter_valid", stops_standard.HasShelterValid(db, gtfsRules.Rule("stops_has_shelter_valid")))
			},
			"stops_has_stop_sign_allowed": func() {
				check("stops_has_stop_sign_allowed", stops_standard.HasStopSignAllowed(db, gtfsRules.Rule("stops_has_stop_sign_allowed")))
			},
			"stops_has_stop_sign_valid": func() {
				check("stops_has_stop_sign_valid", stops_standard.HasStopSignValid(db, gtfsRules.Rule("stops_has_stop_sign_valid")))
			},
			"stops_has_tariffs_information_allowed": func() {
				check("stops_has_tariffs_information_allowed", stops_standard.HasTariffsInformationAllowed(db, gtfsRules.Rule("stops_has_tariffs_information_allowed")))
			},
			"stops_has_tariffs_information_valid": func() {
				check("stops_has_tariffs_information_valid", stops_standard.HasTariffsInformationValid(db, gtfsRules.Rule("stops_has_tariffs_information_valid")))
			},
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating stops: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed stops.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
