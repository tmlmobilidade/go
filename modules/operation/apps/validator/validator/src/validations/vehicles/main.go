package municipalities

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/vehicles/validations"
)

func init() {
	registry.Register("vehicles", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.VehiclesRules
	if rules != nil {
		section = &rules.Vehicles
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Vehicles Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "vehicles", config.ProgressThresholdLarge)

	err := gtfs.IterateVehicles(func(i int, rawVehicles types.VehicleRaw) error {
		tracker.Track()
		vehicle := validations.ParseVehicles(rawVehicles, i)

		if vehicle == (types.Vehicle{}) {
			return nil
		}

		var vehicleRules *types.VehiclesRules
		if rules != nil {
			vehicleRules = &rules.Vehicles
		}

		// Validate vehicle_id
		runner.Run(services.RuleActions{
			"vehicle_id_unique":                                func() { validations.VehicleIdValidation(&vehicle, i, &gtfs, vehicleRules) },
			"vehicle_agency_id_references_agency_table":        func() { validations.AgencyIdValidation(&vehicle, i, &gtfs, vehicleRules) },
			"vehicles_license_plate_format_per_market_rules":   func() { validations.LicensePlateValidation(&vehicle, i, &gtfs, vehicleRules) },
			"vehicle_make_required":                            func() { validations.MakeValidation(&vehicle, i, vehicleRules) },
			"vehicle_model_required":                           func() { validations.ModelValidation(&vehicle, i, vehicleRules) },
			"vehicle_owner_required":                           func() { validations.OwnerValidation(&vehicle, i, vehicleRules) },
			"vehicles_registration_date_valid_day_granularity": func() { validations.RegistrationDateValidation(&vehicle, i, vehicleRules) },
			"vehicles_available_seats_non_negative":            func() { validations.AvailableSeatsValidation(&vehicle, i, vehicleRules) },
			"vehicles_available_standing_non_negative":         func() { validations.AvailableStandingValidation(&vehicle, i, vehicleRules) },
			"vehicles_typology_in_allowed_vehicle_types":       func() { validations.TypologyValidation(&vehicle, i, vehicleRules) },
			"vehicles_propulsion_type_valid_enum":              func() { validations.PropulsionValidation(&vehicle, i, vehicleRules) },
			"vehicles_emission_code_valid_for_propulsion_type": func() { validations.EmissionValidation(&vehicle, i, vehicleRules) },
			"vehicles_climatization_valid_enum":                func() { validations.ClimatizationValidation(&vehicle, i, vehicleRules) },
			"vehicles_wheelchair_spots_valid_enum":             func() { validations.WheelchairValidation(&vehicle, i, vehicleRules) },
			"vehicles_lowered_floor_valid_enum":                func() { validations.LoweredFloorValidation(&vehicle, i, vehicleRules) },
			"vehicles_ramp_valid_enum":                         func() { validations.RampValidation(&vehicle, i, vehicleRules) },
			"vehicles_kneeling_valid_enum":                     func() { validations.KneelingValidation(&vehicle, i, vehicleRules) },
			"vehicles_static_information_valid_enum":           func() { validations.StaticInformationValidation(&vehicle, i, vehicleRules) },
			"vehicles_onboard_monitor_valid_enum":              func() { validations.OnboardMonitorValidation(&vehicle, i, vehicleRules) },
			"vehicles_front_display_valid_enum":                func() { validations.FrontDisplayValidation(&vehicle, i, vehicleRules) },
			"vehicles_rear_display_valid_enum":                 func() { validations.RearDisplayValidation(&vehicle, i, vehicleRules) },
			"vehicles_side_display_valid_enum":                 func() { validations.SideDisplayValidation(&vehicle, i, vehicleRules) },
			"vehicles_internal_sound_level_valid_enum":         func() { validations.InternalSoundValidation(&vehicle, i, vehicleRules) },
			"vehicles_external_sound_valid_enum":               func() { validations.ExternalSoundValidation(&vehicle, i, vehicleRules) },
			"vehicles_consumption_meter_valid_format":          func() { validations.ConsumptionMeterValidation(&vehicle, i, vehicleRules) },
			"vehicles_bicycles_rack_count_non_negative":        func() { validations.BicyclesValidation(&vehicle, i, vehicleRules) },
			"vehicles_passenger_counting_valid_enum":           func() { validations.PassengerCountingValidation(&vehicle, i, vehicleRules) },
			"vehicles_video_surveillance_valid_enum":           func() { validations.VideoSurveillanceValidation(&vehicle, i, vehicleRules) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating vehicles: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed vehicles.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}

}
