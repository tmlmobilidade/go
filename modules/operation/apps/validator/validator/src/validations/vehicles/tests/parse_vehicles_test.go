package vehicles

import (
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestParseVehicles_ValidInput(t *testing.T) {
	services.AppMessageService.Clear()

	raw := types.VehicleRaw{
		VehicleId:            "V1",
		AgencyId:             "A1",
		LicensePlate:         "AA-00-BB",
		Make:                 "Mercedes",
		Model:                "Citaro",
		RegistrationDate:     "20240101",
		VehicleType:          "3",
		Emission:             "Euro VI",
		Propulsion:           "2",
		WheelchairAccessible: "1",
		BicyclesCapacity:     "4",
		TotalCapacity:        "80",
		CarCapacity:          "0",
	}

	vehicle := validations.ParseVehicles(raw, 1)

	assertStringField(t, "VehicleId", vehicle.VehicleId, "V1")
	assertStringField(t, "AgencyId", vehicle.AgencyId, "A1")
	assertStringField(t, "LicensePlate", vehicle.LicensePlate, "AA-00-BB")
	assertStringField(t, "Make", vehicle.Make, "Mercedes")
	assertStringField(t, "Model", vehicle.Model, "Citaro")
	assertStringField(t, "RegistrationDate", vehicle.RegistrationDate, "20240101")
	assertStringField(t, "Emission", vehicle.Emission, "Euro VI")

	assertIntField(t, "VehicleType", vehicle.VehicleType, 3)
	assertIntField(t, "Propulsion", vehicle.Propulsion, 2)
	assertIntField(t, "WheelchairAccessible", vehicle.WheelchairAccessible, 1)
	assertIntField(t, "BicyclesCapacity", vehicle.BicyclesCapacity, 4)
	assertIntField(t, "TotalCapacity", vehicle.TotalCapacity, 80)
	assertIntField(t, "CarCapacity", vehicle.CarCapacity, 0)

	if summary := services.AppMessageService.GetSummary(); summary.TotalErrors != 0 {
		t.Errorf("Expected no parse errors, got %d", summary.TotalErrors)
	}
}

func TestParseVehicles_EmptyFieldsAreNil(t *testing.T) {
	services.AppMessageService.Clear()

	vehicle := validations.ParseVehicles(types.VehicleRaw{VehicleId: "V1"}, 1)

	if vehicle.VehicleId == nil || *vehicle.VehicleId != "V1" {
		t.Fatalf("Expected VehicleId 'V1', got '%v'", vehicle.VehicleId)
	}

	nilFields := map[string]bool{
		"AgencyId":             vehicle.AgencyId == nil,
		"LicensePlate":         vehicle.LicensePlate == nil,
		"Make":                 vehicle.Make == nil,
		"Model":                vehicle.Model == nil,
		"RegistrationDate":     vehicle.RegistrationDate == nil,
		"VehicleType":          vehicle.VehicleType == nil,
		"Emission":             vehicle.Emission == nil,
		"Propulsion":           vehicle.Propulsion == nil,
		"WheelchairAccessible": vehicle.WheelchairAccessible == nil,
		"BicyclesCapacity":     vehicle.BicyclesCapacity == nil,
		"TotalCapacity":        vehicle.TotalCapacity == nil,
		"CarCapacity":          vehicle.CarCapacity == nil,
	}
	for field, isNil := range nilFields {
		if !isNil {
			t.Errorf("Expected %s to be nil when the raw value is empty", field)
		}
	}
}

func TestParseVehicles_ZeroValuesAreKept(t *testing.T) {
	services.AppMessageService.Clear()

	raw := types.VehicleRaw{
		VehicleId:            "V1",
		VehicleType:          "0",
		Propulsion:           "0",
		WheelchairAccessible: "0",
		BicyclesCapacity:     "0",
		TotalCapacity:        "0",
		CarCapacity:          "0",
	}

	vehicle := validations.ParseVehicles(raw, 1)

	assertIntField(t, "VehicleType", vehicle.VehicleType, 0)
	assertIntField(t, "Propulsion", vehicle.Propulsion, 0)
	assertIntField(t, "WheelchairAccessible", vehicle.WheelchairAccessible, 0)
	assertIntField(t, "BicyclesCapacity", vehicle.BicyclesCapacity, 0)
	assertIntField(t, "TotalCapacity", vehicle.TotalCapacity, 0)
	assertIntField(t, "CarCapacity", vehicle.CarCapacity, 0)
}

func TestParseVehicles_InvalidIntReturnsEmptyVehicle(t *testing.T) {
	services.AppMessageService.Clear()

	raw := types.VehicleRaw{
		VehicleId:  "V1",
		Propulsion: "not-a-number",
	}

	vehicle := validations.ParseVehicles(raw, 1)

	if vehicle != (types.Vehicle{}) {
		t.Errorf("Expected an empty vehicle when a field fails to parse, got %+v", vehicle)
	}
	if summary := services.AppMessageService.GetSummary(); summary.TotalErrors != 1 {
		t.Errorf("Expected 1 parse error, got %d", summary.TotalErrors)
	}
}

func assertStringField(t *testing.T, name string, got *string, want string) {
	t.Helper()
	if got == nil {
		t.Errorf("Expected %s '%s', got nil", name, want)
		return
	}
	if *got != want {
		t.Errorf("Expected %s '%s', got '%s'", name, want, *got)
	}
}

func assertIntField(t *testing.T, name string, got *int, want int) {
	t.Helper()
	if got == nil {
		t.Errorf("Expected %s '%d', got nil", name, want)
		return
	}
	if *got != want {
		t.Errorf("Expected %s '%d', got '%d'", name, want, *got)
	}
}
