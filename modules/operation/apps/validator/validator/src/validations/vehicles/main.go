package municipalities

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/vehicles/validations"
)

func init() {
	registry.Register("vehicles", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
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
		validations.VehicleIdValidation(&vehicle, i, &gtfs, vehicleRules)

		// Validate agency_id
		validations.AgencyIdValidation(&vehicle, i, &gtfs, vehicleRules)

		// Validate license_plate
		validations.LicensePlateValidation(&vehicle, i, &gtfs, vehicleRules)

		// Validate make
		validations.MakeValidation(&vehicle, i, vehicleRules)

		// Validate model
		validations.ModelValidation(&vehicle, i, vehicleRules)

		// Validate owner
		validations.OwnerValidation(&vehicle, i, vehicleRules)

		// Validate registration_date
		validations.RegistrationDateValidation(&vehicle, i, vehicleRules)

		// Validate available_seats
		validations.AvailableSeatsValidation(&vehicle, i, vehicleRules)

		// Validate available_standing
		validations.AvailableStandingValidation(&vehicle, i, vehicleRules)

		// Validate typology
		validations.TypologyValidation(&vehicle, i, vehicleRules)

		// Validate propulsion
		validations.PropulsionValidation(&vehicle, i, vehicleRules)

		// Validate emission
		validations.EmissionValidation(&vehicle, i, vehicleRules)

		// Validate climatization
		validations.ClimatizationValidation(&vehicle, i, vehicleRules)

		// Validate wheelchair
		validations.WheelchairValidation(&vehicle, i, vehicleRules)

		// Validate lowered_floor
		validations.LoweredFloorValidation(&vehicle, i, vehicleRules)

		// Validate ramp
		validations.RampValidation(&vehicle, i, vehicleRules)

		// Validate kneeling
		validations.KneelingValidation(&vehicle, i, vehicleRules)

		// Validate static_information
		validations.StaticInformationValidation(&vehicle, i, vehicleRules)

		// Validate onboard_monitor
		validations.OnboardMonitorValidation(&vehicle, i, vehicleRules)

		// Validate front_display
		validations.FrontDisplayValidation(&vehicle, i, vehicleRules)

		// Validate rear_display
		validations.RearDisplayValidation(&vehicle, i, vehicleRules)

		// Validate side_display
		validations.SideDisplayValidation(&vehicle, i, vehicleRules)

		// Validate internal_sound
		validations.InternalSoundValidation(&vehicle, i, vehicleRules)

		// Validate external_sound
		validations.ExternalSoundValidation(&vehicle, i, vehicleRules)

		// Validate consumption_meter
		validations.ConsumptionMeterValidation(&vehicle, i, vehicleRules)

		// Validate bicycles
		validations.BicyclesValidation(&vehicle, i, vehicleRules)

		// Validate passenger_counting
		validations.PassengerCountingValidation(&vehicle, i, vehicleRules)

		// Validate video_surveillance
		validations.VideoSurveillanceValidation(&vehicle, i, vehicleRules)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating vehicles: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed vehicles.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}

}
