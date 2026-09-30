package vehicles

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func newVehiclesGtfs(t *testing.T, licensePlates ...string) (*types.Gtfs, func()) {
	t.Helper()

	rows := make([]map[string]string, 0, len(licensePlates))
	for _, plate := range licensePlates {
		rows = append(rows, map[string]string{"license_plate": plate})
	}

	gtfs, cleanup, err := test_helpers.MockGtfs{
		TableData: map[string][]map[string]string{"vehicles": rows},
	}.ToGtfsWithDB()
	if err != nil {
		t.Fatalf("failed to create mock gtfs: %v", err)
	}
	return gtfs, cleanup
}

func TestAllLicensePlateValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("license_plate") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{LicensePlate: nil}
			rules := &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: tc.Severity}}

			validations.LicensePlateValidation(vehicle, tc.Row, nil, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{LicensePlate: lib.Ptr("AA-00-BB")}
		rules := &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.LicensePlateValidation(vehicle, 1, nil, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})
}

// Plates are accepted in every Portuguese layout, with or without separators.
func TestLicensePlateValidation_ValidPlateFormats(t *testing.T) {
	plates := []string{
		"AA-00-BB",
		"00-AA-00",
		"00-00-AA",
		"AA-00-00",
		"AA00BB",
		"aa-00-bb",
		"AA 00 BB",
		"AA.00.BB",
	}

	for _, plate := range plates {
		t.Run(plate, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{LicensePlate: lib.Ptr(plate)}
			rules := &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.LicensePlateValidation(vehicle, 1, nil, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, plate, types.SEVERITY_ERROR)
		})
	}
}

// Ferries identify the vehicle unit by MMSI instead of a license plate.
func TestLicensePlateValidation_AcceptsMMSIForFerries(t *testing.T) {
	valid := []string{
		"263123456", // Portugal
		"223456789",
		"723456789",
	}

	for _, mmsi := range valid {
		t.Run("Valid_"+mmsi, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{LicensePlate: lib.Ptr(mmsi)}
			rules := &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.LicensePlateValidation(vehicle, 1, nil, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, mmsi, types.SEVERITY_ERROR)
		})
	}

	invalid := []string{
		"123456789",  // MID must start with 2-7
		"863123456",  // MID must start with 2-7
		"26312345",   // too short
		"2631234567", // too long
		"26312345A",  // not all digits
		"263-123-456",
	}

	for _, mmsi := range invalid {
		t.Run("Invalid_"+mmsi, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{LicensePlate: lib.Ptr(mmsi)}
			rules := &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.LicensePlateValidation(vehicle, 1, nil, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 1, mmsi, types.SEVERITY_ERROR)
		})
	}
}

func TestLicensePlateValidation_InvalidFormats(t *testing.T) {
	plates := []string{
		"AA-00-BB-1",
		"AAAAAA",
		"000000",
		"AA-0-BB",
		"",
	}

	for _, plate := range plates {
		t.Run(plate, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{LicensePlate: lib.Ptr(plate)}
			rules := &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.LicensePlateValidation(vehicle, 1, nil, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 1, plate, types.SEVERITY_ERROR)
		})
	}
}

func TestLicensePlateValidation_Uniqueness(t *testing.T) {
	t.Run("Unique", func(t *testing.T) {
		services.AppMessageService.Clear()

		gtfs, cleanup := newVehiclesGtfs(t, "AA-00-BB", "CC-22-DD")
		defer cleanup()

		vehicle := &types.Vehicle{LicensePlate: lib.Ptr("AA-00-BB")}
		rules := &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

		validations.LicensePlateValidation(vehicle, 0, gtfs, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Unique", types.SEVERITY_ERROR)
	})

	t.Run("Duplicate_Is_Always_An_Error", func(t *testing.T) {
		services.AppMessageService.Clear()

		gtfs, cleanup := newVehiclesGtfs(t, "AA-00-BB", "CC-22-DD", "AA-00-BB")
		defer cleanup()

		vehicle := &types.Vehicle{LicensePlate: lib.Ptr("AA-00-BB")}
		rules := &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: types.SEVERITY_WARNING}}

		validations.LicensePlateValidation(vehicle, 0, gtfs, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Duplicate_Is_Always_An_Error", types.SEVERITY_ERROR)
	})

	t.Run("Duplicate_MMSI", func(t *testing.T) {
		services.AppMessageService.Clear()

		gtfs, cleanup := newVehiclesGtfs(t, "263123456", "263123456")
		defer cleanup()

		vehicle := &types.Vehicle{LicensePlate: lib.Ptr("263123456")}
		rules := &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

		validations.LicensePlateValidation(vehicle, 0, gtfs, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Duplicate_MMSI", types.SEVERITY_ERROR)
	})

	t.Run("Nil_Gtfs_Skips_Uniqueness", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{LicensePlate: lib.Ptr("AA-00-BB")}
		rules := &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

		validations.LicensePlateValidation(vehicle, 0, nil, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Nil_Gtfs_Skips_Uniqueness", types.SEVERITY_ERROR)
	})
}
