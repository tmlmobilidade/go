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
			"vehicle_id_unique":                         func() { validations.VehicleIdValidation(&vehicle, i, &gtfs, vehicleRules) },
			"vehicle_agency_id_references_agency_table": func() { validations.AgencyIdValidation(&vehicle, i, &gtfs, vehicleRules) },
			"license_plate_format_per_market_rules":     func() { validations.LicensePlateValidation(&vehicle, i, &gtfs, vehicleRules) },
			"vehicle_make_required":                     func() { validations.MakeValidation(&vehicle, i, vehicleRules) },
			"vehicle_model_required":                    func() { validations.ModelValidation(&vehicle, i, vehicleRules) },
			"vehicle_owner_required":                    func() { validations.OwnerValidation(&vehicle, i, vehicleRules) },
			"registration_date_valid_day_granularity":   func() { validations.RegistrationDateValidation(&vehicle, i, vehicleRules) },
			"available_seats_non_negative":              func() { validations.AvailableSeatsValidation(&vehicle, i, vehicleRules) },
			"available_standing_non_negative":           func() { validations.AvailableStandingValidation(&vehicle, i, vehicleRules) },
			"typology_in_allowed_vehicle_types":         func() { validations.TypologyValidation(&vehicle, i, vehicleRules) },
			"propulsion_type_valid_enum":                func() { validations.PropulsionValidation(&vehicle, i, vehicleRules) },
			"emission_code_valid_for_propulsion_type":   func() { validations.EmissionValidation(&vehicle, i, vehicleRules) },
			"climatization_valid_enum":                  func() { validations.ClimatizationValidation(&vehicle, i, vehicleRules) },
			"wheelchair_spots_valid_enum":               func() { validations.WheelchairValidation(&vehicle, i, vehicleRules) },
			"lowered_floor_valid_enum":                  func() { validations.LoweredFloorValidation(&vehicle, i, vehicleRules) },
			"ramp_valid_enum":                           func() { validations.RampValidation(&vehicle, i, vehicleRules) },
			"kneeling_valid_enum":                       func() { validations.KneelingValidation(&vehicle, i, vehicleRules) },
			"static_information_valid_enum":             func() { validations.StaticInformationValidation(&vehicle, i, vehicleRules) },
			"onboard_monitor_valid_enum":                func() { validations.OnboardMonitorValidation(&vehicle, i, vehicleRules) },
			"front_display_valid_enum":                  func() { validations.FrontDisplayValidation(&vehicle, i, vehicleRules) },
			"rear_display_valid_enum":                   func() { validations.RearDisplayValidation(&vehicle, i, vehicleRules) },
			"side_display_valid_enum":                   func() { validations.SideDisplayValidation(&vehicle, i, vehicleRules) },
			"internal_sound_level_valid_enum":           func() { validations.InternalSoundValidation(&vehicle, i, vehicleRules) },
			"external_sound_valid_enum":                 func() { validations.ExternalSoundValidation(&vehicle, i, vehicleRules) },
			"consumption_meter_valid_format":            func() { validations.ConsumptionMeterValidation(&vehicle, i, vehicleRules) },
			"bicycles_rack_count_non_negative":          func() { validations.BicyclesValidation(&vehicle, i, vehicleRules) },
			"passenger_counting_valid_enum":             func() { validations.PassengerCountingValidation(&vehicle, i, vehicleRules) },
			"video_surveillance_valid_enum":             func() { validations.VideoSurveillanceValidation(&vehicle, i, vehicleRules) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating vehicles: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed vehicles.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}

}
