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
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "vehicles")
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

		// Validate vehicle_id
		runner.Run(services.RuleActions{
			"vehicle_id_unique": func() { validations.VehicleIdValidation(&vehicle, i, &gtfs, rules.Rule("vehicle_id_unique")) },
			"vehicle_agency_id_references_agency_table": func() {
				validations.AgencyIdValidation(&vehicle, i, &gtfs, rules.Rule("vehicle_agency_id_references_agency_table"))
			},
			"vehicles_license_plate_format_per_market_rules": func() {
				validations.LicensePlateValidation(&vehicle, i, &gtfs, rules.Rule("vehicles_license_plate_format_per_market_rules"))
			},
			"vehicle_make_required":  func() { validations.MakeValidation(&vehicle, i, rules.Rule("vehicle_make_required")) },
			"vehicle_model_required": func() { validations.ModelValidation(&vehicle, i, rules.Rule("vehicle_model_required")) },
			"vehicles_registration_date_valid_day_granularity": func() {
				validations.RegistrationDateValidation(&vehicle, i, rules.Rule("vehicles_registration_date_valid_day_granularity"))
			},
			"vehicles_vehicle_type_valid_enum": func() {
				validations.VehicleTypeValidation(&vehicle, i, rules.Rule("vehicles_vehicle_type_valid_enum"))
			},
			"vehicles_emission_valid_enum": func() { validations.EmissionValidation(&vehicle, i, rules.Rule("vehicles_emission_valid_enum")) },
			"vehicles_propulsion_valid_enum": func() {
				validations.PropulsionValidation(&vehicle, i, rules.Rule("vehicles_propulsion_valid_enum"))
			},
			"vehicles_wheelchair_accessible_valid_gtfs_enum": func() {
				validations.WheelchairAccessibleValidation(&vehicle, i, rules.Rule("vehicles_wheelchair_accessible_valid_gtfs_enum"))
			},
			"vehicles_bicycles_rack_count_non_negative": func() {
				validations.BicyclesCapacityValidation(&vehicle, i, rules.Rule("vehicles_bicycles_rack_count_non_negative"))
			},
			"vehicles_total_capacity_non_negative": func() {
				validations.TotalCapacityValidation(&vehicle, i, rules.Rule("vehicles_total_capacity_non_negative"))
			},
			"vehicles_car_capacity_non_negative": func() {
				validations.CarCapacityValidation(&vehicle, i, rules.Rule("vehicles_car_capacity_non_negative"))
			},
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating vehicles: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed vehicles.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}

}
