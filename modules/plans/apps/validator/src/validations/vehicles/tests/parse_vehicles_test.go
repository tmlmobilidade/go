package tests

import (
	"main/lib"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestParseVehicles_Valid(t *testing.T) {
	services.AppMessageService.Clear()

	raw := types.VehicleRaw{
		VehicleId:         "V1",
		AgencyId:          "A1",
		LicensePlate:      "AA-00-BB",
		Make:              "Make",
		Model:             "Model",
		Owner:             "Owner",
		RegistrationDate:  "2025-01-01",
		AvailableSeats:    "10",
		AvailableStanding: "20",
		Typology:          "bus",
		Propulsion:        "1",
		Emission:          "2",
		Climatization:     "1",
		Wheelchair:        "1",
		LoweredFloor:      "1",
		Ramp:              "1",
		Kneeling:          "0",
		StaticInformation: "1",
		OnboardMonitor:    "1",
		FrontDisplay:      "1",
		RearDisplay:       "1",
		SideDisplay:       "1",
		InternalSound:     "1",
		ExternalSound:     "1",
		ConsumptionMeter:  "1",
		Bicycles:          "1",
		PassengerCounting: "1",
		VideoSurveillance: "1",
	}

	vehicle := validations.ParseVehicles(raw, 1)

	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Valid vehicle input should not produce errors",
	}

	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	if vehicle.VehicleId == nil || *vehicle.VehicleId != "V1" {
		t.Errorf("expected VehicleId 'V1', got '%v'", vehicle.VehicleId)
	}

	if vehicle.LicensePlate == nil || *vehicle.LicensePlate != "AA-00-BB" {
		t.Errorf("expected LicensePlate 'AA-00-BB', got '%v'", vehicle.LicensePlate)
	}

	if vehicle.AvailableSeats == nil || *vehicle.AvailableSeats != 10 {
		t.Errorf("expected AvailableSeats 10, got '%v'", vehicle.AvailableSeats)
	}

	if vehicle.Propulsion == nil || *vehicle.Propulsion != 1 {
		t.Errorf("expected Propulsion 1, got '%v'", vehicle.Propulsion)
	}
}

func TestParseVehicles_InvalidIntField(t *testing.T) {
	services.AppMessageService.Clear()

	raw := types.VehicleRaw{
		VehicleId:      "V1",
		AgencyId:       "A1",
		AvailableSeats: "not_an_int",
	}

	_ = validations.ParseVehicles(raw, 1)

	assertion := lib.AssertionMessage{
		Expected: 1,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Invalid available_seats should produce one error",
	}

	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
}
