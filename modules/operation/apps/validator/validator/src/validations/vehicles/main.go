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
			"vehicles_registration_date_valid_day_granularity": func() { validations.RegistrationDateValidation(&vehicle, i, vehicleRules) },
			"vehicles_vehicle_type_valid_enum":                 func() { validations.VehicleTypeValidation(&vehicle, i, vehicleRules) },
			"vehicles_emission_valid_enum":                     func() { validations.EmissionValidation(&vehicle, i, vehicleRules) },
			"vehicles_propulsion_valid_enum":                   func() { validations.PropulsionValidation(&vehicle, i, vehicleRules) },
			"vehicles_wheelchair_accessible_valid_gtfs_enum":   func() { validations.WheelchairAccessibleValidation(&vehicle, i, vehicleRules) },
			"vehicles_bicycles_rack_count_non_negative":        func() { validations.BicyclesCapacityValidation(&vehicle, i, vehicleRules) },
			"vehicles_total_capacity_non_negative":             func() { validations.TotalCapacityValidation(&vehicle, i, vehicleRules) },
			"vehicles_car_capacity_non_negative":               func() { validations.CarCapacityValidation(&vehicle, i, vehicleRules) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating vehicles: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed vehicles.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}

}
