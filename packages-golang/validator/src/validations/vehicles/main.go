package vehicles

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	vehicles_custom "main/validations/vehicles/custom/checks"
	vehicles_fields "main/validations/vehicles/fields/checks"
	vehicles_standard "main/validations/vehicles/standard/checks"
)

func init() {
	registry.RegisterWithTables("vehicles", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "vehicles")
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	table, err := tables.Table("vehicles")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	check := func(db *services.SQLiteContext, ruleID string, err error) {
		if err != nil {
			ctx := lib.NewValidationContext("N/A", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
			ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
		}
	}
	lib.AppLogger.Debug("Running Vehicles Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "vehicles", config.ProgressThresholdLarge)

	err = runner.RunTable(table, "vehicle", "vehicle_id", func(db *services.SQLiteContext) services.RuleActions {
		return services.RuleActions{
			"vehicles_agency_id_field": func() {
				check(db, "vehicles_agency_id_field", vehicles_fields.AgencyIdField(db, rules.Rule("vehicles_agency_id_field")))
			},
			"vehicles_vehicle_id_field": func() {
				check(db, "vehicles_vehicle_id_field", vehicles_fields.VehicleIdField(db, rules.Rule("vehicles_vehicle_id_field")))
			},
			"vehicles_license_plate_field": func() {
				check(db, "vehicles_license_plate_field", vehicles_fields.LicensePlateField(db, rules.Rule("vehicles_license_plate_field")))
			},
			"vehicles_make_field": func() {
				check(db, "vehicles_make_field", vehicles_fields.MakeField(db, rules.Rule("vehicles_make_field")))
			},
			"vehicles_model_field": func() {
				check(db, "vehicles_model_field", vehicles_fields.ModelField(db, rules.Rule("vehicles_model_field")))
			},
			"vehicles_registration_date_field": func() {
				check(db, "vehicles_registration_date_field", vehicles_fields.RegistrationDateField(db, rules.Rule("vehicles_registration_date_field")))
			},
			"vehicles_vehicle_type_field": func() {
				check(db, "vehicles_vehicle_type_field", vehicles_fields.VehicleTypeField(db, rules.Rule("vehicles_vehicle_type_field")))
			},
			"vehicles_emission_field": func() {
				check(db, "vehicles_emission_field", vehicles_fields.EmissionField(db, rules.Rule("vehicles_emission_field")))
			},
			"vehicles_propulsion_field": func() {
				check(db, "vehicles_propulsion_field", vehicles_fields.PropulsionField(db, rules.Rule("vehicles_propulsion_field")))
			},
			"vehicles_wheelchair_accessible_field": func() {
				check(db, "vehicles_wheelchair_accessible_field", vehicles_fields.WheelchairAccessibleField(db, rules.Rule("vehicles_wheelchair_accessible_field")))
			},
			"vehicles_bicycles_capacity_field": func() {
				check(db, "vehicles_bicycles_capacity_field", vehicles_fields.BicyclesCapacityField(db, rules.Rule("vehicles_bicycles_capacity_field")))
			},
			"vehicles_total_capacity_field": func() {
				check(db, "vehicles_total_capacity_field", vehicles_fields.TotalCapacityField(db, rules.Rule("vehicles_total_capacity_field")))
			},
			"vehicles_car_capacity_field": func() {
				check(db, "vehicles_car_capacity_field", vehicles_fields.CarCapacityField(db, rules.Rule("vehicles_car_capacity_field")))
			},
			"vehicles_agency_id_foreign": func() {
				check(db, "vehicles_agency_id_foreign", vehicles_standard.AgencyIdForeign(db, rules.Rule("vehicles_agency_id_foreign")))
			},
			"vehicles_vehicle_id_unique": func() {
				check(db, "vehicles_vehicle_id_unique", vehicles_standard.VehicleIdUnique(db, rules.Rule("vehicles_vehicle_id_unique")))
			},
			"vehicles_propulsion_valid": func() {
				check(db, "vehicles_propulsion_valid", vehicles_standard.PropulsionValid(db, rules.Rule("vehicles_propulsion_valid")))
			},
			"vehicles_total_capacity_valid": func() {
				check(db, "vehicles_total_capacity_valid", vehicles_standard.TotalCapacityValid(db, rules.Rule("vehicles_total_capacity_valid")))
			},
			"vehicles_registration_date_valid": func() {
				check(db, "vehicles_registration_date_valid", vehicles_standard.RegistrationDateValid(db, rules.Rule("vehicles_registration_date_valid")))
			},
			"vehicles_bicycles_capacity_valid": func() {
				check(db, "vehicles_bicycles_capacity_valid", vehicles_standard.BicyclesCapacityValid(db, rules.Rule("vehicles_bicycles_capacity_valid")))
			},
			"vehicles_vehicle_type_valid": func() {
				check(db, "vehicles_vehicle_type_valid", vehicles_standard.VehicleTypeValid(db, rules.Rule("vehicles_vehicle_type_valid")))
			},
			"vehicles_car_capacity_valid": func() {
				check(db, "vehicles_car_capacity_valid", vehicles_standard.CarCapacityValid(db, rules.Rule("vehicles_car_capacity_valid")))
			},
			"vehicles_wheelchair_accessible_valid": func() {
				check(db, "vehicles_wheelchair_accessible_valid", vehicles_standard.WheelchairAccessibleValid(db, rules.Rule("vehicles_wheelchair_accessible_valid")))
			},
			"vehicles_emission_valid": func() {
				check(db, "vehicles_emission_valid", vehicles_standard.EmissionValid(db, rules.Rule("vehicles_emission_valid")))
			},
			"vehicles_license_plate_valid": func() {
				check(db, "vehicles_license_plate_valid", vehicles_custom.LicensePlateValid(db, rules.Rule("vehicles_license_plate_valid")))
			},
		}
	}, tracker.Track)

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating vehicles: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed vehicles.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
