package vehicles

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllVehicleIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("vehicle_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"vehicles": tc.ExistingIds}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			vehicle := &types.Vehicle{VehicleId: tc.Id}
			rules := &types.VehiclesRules{VehicleId: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.VehicleIdValidation(vehicle, tc.Row, gtfs, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("vehicle_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			gtfs, cleanup, err := test_helpers.MockGtfs{}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			vehicle := &types.Vehicle{VehicleId: nil}
			rules := &types.VehiclesRules{VehicleId: types.RuleConfig{Severity: tc.Severity}}

			validations.VehicleIdValidation(vehicle, tc.Row, gtfs, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		gtfs, cleanup, err := test_helpers.MockGtfs{}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		vehicle := &types.Vehicle{VehicleId: lib.Ptr("V1")}
		rules := &types.VehiclesRules{VehicleId: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.VehicleIdValidation(vehicle, 1, gtfs, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})

	t.Run("Nil_Rules_Ignores_Missing_Id", func(t *testing.T) {
		services.AppMessageService.Clear()

		gtfs, cleanup, err := test_helpers.MockGtfs{}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.VehicleIdValidation(&types.Vehicle{VehicleId: nil}, 1, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Nil_Rules_Ignores_Missing_Id", types.SEVERITY_ERROR)
	})

	t.Run("Duplicate_Is_Always_An_Error", func(t *testing.T) {
		services.AppMessageService.Clear()

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"vehicles": {"V1": {0, 1}}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		vehicle := &types.Vehicle{VehicleId: lib.Ptr("V1")}
		rules := &types.VehiclesRules{VehicleId: types.RuleConfig{Severity: types.SEVERITY_WARNING}}

		validations.VehicleIdValidation(vehicle, 1, gtfs, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Duplicate_Is_Always_An_Error", types.SEVERITY_ERROR)
	})
}
