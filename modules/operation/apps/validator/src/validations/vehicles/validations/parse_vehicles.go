package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseVehicles(rawVehicles types.VehicleRaw, row int) types.Vehicle {
	var (
		vehicle                                                                                                                                                                                                                                                                                     types.Vehicle = types.Vehicle{}
		vehicleId, agencyId, licensePlate, make, model, owner, registrationDate, typology                                                                                                                                                                                                           string
		availableSeats, availableStanding, propulsion, emission, climatization, wheelchair, loweredFloor, ramp, kneeling, staticInformation, onboardMonitor, frontDisplay, rearDisplay, sideDisplay, internalSound, externalSound, consumptionMeter, bicycles, passengerCounting, videoSurveillance int
		messages                                                                                                                                                                                                                                                                                    []types.Message
	)

	stringFields := map[string]*string{
		"vehicle_id":        &vehicleId,
		"agency_id":         &agencyId,
		"license_plate":     &licensePlate,
		"make":              &make,
		"model":             &model,
		"owner":             &owner,
		"registration_date": &registrationDate,
		"typology":          &typology,
	}

	intFields := map[string]*int{
		"available_seats":    &availableSeats,
		"available_standing": &availableStanding,
		"propulsion":         &propulsion,
		"emission":           &emission,
		"climatization":      &climatization,
		"wheelchair":         &wheelchair,
		"lowered_floor":      &loweredFloor,
		"ramp":               &ramp,
		"kneeling":           &kneeling,
		"static_information": &staticInformation,
		"onboard_monitor":    &onboardMonitor,
		"front_display":      &frontDisplay,
		"rear_display":       &rearDisplay,
		"side_display":       &sideDisplay,
		"internal_sound":     &internalSound,
		"external_sound":     &externalSound,
		"consumption_meter":  &consumptionMeter,
		"bicycles":           &bicycles,
		"passenger_counting": &passengerCounting,
		"video_surveillance": &videoSurveillance,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:        field,
			FileName:     "vehicles.txt",
			Rows:         []int{row},
			Message:      msg,
			Severity:     types.SEVERITY_ERROR,
			RuleID:       "vehicles_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawVehicles, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse int fields
	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawVehicles, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// If there are any errors, return an empty trip
	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return vehicle
	}

	// Required fields
	vehicle.VehicleId = lib.IfThenElse(vehicleId != "", &vehicleId, nil)
	vehicle.AgencyId = lib.IfThenElse(agencyId != "", &agencyId, nil)
	vehicle.LicensePlate = lib.IfThenElse(licensePlate != "", &licensePlate, nil)
	vehicle.Make = lib.IfThenElse(make != "", &make, nil)
	vehicle.Model = lib.IfThenElse(model != "", &model, nil)
	vehicle.Owner = lib.IfThenElse(owner != "", &owner, nil)
	vehicle.RegistrationDate = lib.IfThenElse(registrationDate != "", &registrationDate, nil)
	vehicle.AvailableSeats = lib.IfThenElse(rawVehicles.AvailableSeats != "", &availableSeats, nil)
	vehicle.AvailableStanding = lib.IfThenElse(rawVehicles.AvailableStanding != "", &availableStanding, nil)
	vehicle.Typology = lib.IfThenElse(typology != "", &typology, nil)
	vehicle.Propulsion = lib.IfThenElse(rawVehicles.Propulsion != "", &propulsion, nil)
	vehicle.Emission = lib.IfThenElse(rawVehicles.Emission != "", &emission, nil)
	vehicle.Climatization = lib.IfThenElse(rawVehicles.Climatization != "", &climatization, nil)
	vehicle.Wheelchair = lib.IfThenElse(rawVehicles.Wheelchair != "", &wheelchair, nil)
	vehicle.LoweredFloor = lib.IfThenElse(rawVehicles.LoweredFloor != "", &loweredFloor, nil)
	vehicle.Ramp = lib.IfThenElse(rawVehicles.Ramp != "", &ramp, nil)
	vehicle.Kneeling = lib.IfThenElse(rawVehicles.Kneeling != "", &kneeling, nil)
	vehicle.StaticInformation = lib.IfThenElse(rawVehicles.StaticInformation != "", &staticInformation, nil)
	vehicle.OnboardMonitor = lib.IfThenElse(rawVehicles.OnboardMonitor != "", &onboardMonitor, nil)
	vehicle.FrontDisplay = lib.IfThenElse(rawVehicles.FrontDisplay != "", &frontDisplay, nil)
	vehicle.RearDisplay = lib.IfThenElse(rawVehicles.RearDisplay != "", &rearDisplay, nil)
	vehicle.SideDisplay = lib.IfThenElse(rawVehicles.SideDisplay != "", &sideDisplay, nil)
	vehicle.InternalSound = lib.IfThenElse(rawVehicles.InternalSound != "", &internalSound, nil)
	vehicle.ExternalSound = lib.IfThenElse(rawVehicles.ExternalSound != "", &externalSound, nil)
	vehicle.ConsumptionMeter = lib.IfThenElse(rawVehicles.ConsumptionMeter != "", &consumptionMeter, nil)
	vehicle.Bicycles = lib.IfThenElse(rawVehicles.Bicycles != "", &bicycles, nil)
	vehicle.PassengerCounting = lib.IfThenElse(rawVehicles.PassengerCounting != "", &passengerCounting, nil)
	vehicle.VideoSurveillance = lib.IfThenElse(rawVehicles.VideoSurveillance != "", &videoSurveillance, nil)

	return vehicle
}
