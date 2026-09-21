package tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllLicensePlateValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("license_plate") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var licensePlate *string
			if tc.Value != nil {
				if v, ok := tc.Value.(*string); ok {
					licensePlate = v
				}
			}
			vehicle := &types.Vehicle{LicensePlate: licensePlate}
			validations.LicensePlateValidation(vehicle, tc.Row, nil, &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}
	t.Run("UniqueLicensePlate", func(t *testing.T) {
		services.AppMessageService.Clear()
		plate := lib.Ptr("AA-00-BB")
		vehicle := &types.Vehicle{LicensePlate: plate}
		gtfs, cleanup, err := test_helpers.MockGtfs{
			TableData: map[string][]map[string]string{
				"vehicles": {
					{"license_plate": "AA-00-BB"},
					{"license_plate": "CC-22-DD"},
				},
			},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.LicensePlateValidation(vehicle, 0, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Unique license plate should not error", types.SEVERITY_ERROR)
	})

	t.Run("DuplicateLicensePlate", func(t *testing.T) {
		services.AppMessageService.Clear()
		plate := lib.Ptr("AA-00-BB")
		vehicle := &types.Vehicle{LicensePlate: plate}
		gtfs, cleanup, err := test_helpers.MockGtfs{
			TableData: map[string][]map[string]string{
				"vehicles": {
					{"license_plate": "AA-00-BB"},
					{"license_plate": "CC-22-DD"},
					{"license_plate": "AA-00-BB"},
				},
			},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.LicensePlateValidation(vehicle, 0, gtfs, &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Duplicate license plate should error", types.SEVERITY_ERROR)
	})

	t.Run("InvalidLicensePlate", func(t *testing.T) {
		services.AppMessageService.Clear()
		plate := lib.Ptr("AA-00-BB-1")
		vehicle := &types.Vehicle{LicensePlate: plate}
		validations.LicensePlateValidation(vehicle, 0, nil, &types.VehiclesRules{LicensePlate: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Duplicate license plate should error", types.SEVERITY_ERROR)
	})
}
