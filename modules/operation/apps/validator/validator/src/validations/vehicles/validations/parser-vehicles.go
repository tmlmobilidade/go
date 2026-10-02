package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseVehicles(rawVehicles types.VehicleRaw, row int) types.Vehicle {
	var (
		vehicle                                                                                     types.Vehicle = types.Vehicle{}
		vehicleId, agencyId, licensePlate, make, model, registrationDate, emission                  string
		vehicleType, propulsion, wheelchairAccessible, bicyclesCapacity, totalCapacity, carCapacity int
		messages                                                                                    []types.Message
	)

	stringFields := map[string]*string{
		"vehicle_id":        &vehicleId,
		"agency_id":         &agencyId,
		"license_plate":     &licensePlate,
		"make":              &make,
		"model":             &model,
		"registration_date": &registrationDate,
		"emission":          &emission,
	}

	intFields := map[string]*int{
		"vehicle_type":          &vehicleType,
		"propulsion":            &propulsion,
		"wheelchair_accessible": &wheelchairAccessible,
		"bicycles_capacity":     &bicyclesCapacity,
		"total_capacity":        &totalCapacity,
		"car_capacity":          &carCapacity,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:    field,
			FileName: "vehicles.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: types.SEVERITY_ERROR,
			RuleID:   "vehicles_values_parse",
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
	vehicle.VehicleId = lib.IfThenElse(rawVehicles.VehicleId != "", &vehicleId, nil)
	vehicle.AgencyId = lib.IfThenElse(rawVehicles.AgencyId != "", &agencyId, nil)
	vehicle.LicensePlate = lib.IfThenElse(rawVehicles.LicensePlate != "", &licensePlate, nil)
	vehicle.Make = lib.IfThenElse(rawVehicles.Make != "", &make, nil)
	vehicle.Model = lib.IfThenElse(rawVehicles.Model != "", &model, nil)
	vehicle.RegistrationDate = lib.IfThenElse(rawVehicles.RegistrationDate != "", &registrationDate, nil)
	vehicle.VehicleType = lib.IfThenElse(rawVehicles.VehicleType != "", &vehicleType, nil)
	vehicle.Propulsion = lib.IfThenElse(rawVehicles.Propulsion != "", &propulsion, nil)
	vehicle.Emission = lib.IfThenElse(rawVehicles.Emission != "", &emission, nil)
	vehicle.WheelchairAccessible = lib.IfThenElse(rawVehicles.WheelchairAccessible != "", &wheelchairAccessible, nil)
	vehicle.BicyclesCapacity = lib.IfThenElse(rawVehicles.BicyclesCapacity != "", &bicyclesCapacity, nil)
	vehicle.TotalCapacity = lib.IfThenElse(rawVehicles.TotalCapacity != "", &totalCapacity, nil)
	vehicle.CarCapacity = lib.IfThenElse(rawVehicles.CarCapacity != "", &carCapacity, nil)

	return vehicle
}
