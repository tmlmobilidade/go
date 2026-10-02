package vehicles

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func newAgencyGtfs(t *testing.T, agencyIds ...string) (*types.Gtfs, func()) {
	t.Helper()

	ids := make(map[string][]int, len(agencyIds))
	for i, id := range agencyIds {
		ids[id] = []int{i}
	}

	gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"agency": ids}}.ToGtfsWithDB()
	if err != nil {
		t.Fatalf("failed to create mock gtfs: %v", err)
	}
	return gtfs, cleanup
}

func TestAllVehicleAgencyIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("agency_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			gtfs, cleanup := newAgencyGtfs(t, "A1")
			defer cleanup()

			vehicle := &types.Vehicle{AgencyId: nil}
			rules := &types.VehiclesRules{AgencyId: types.RuleConfig{Severity: tc.Severity}}

			validations.AgencyIdValidation(vehicle, tc.Row, gtfs, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("agency_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			gtfs, cleanup := newAgencyGtfs(t, "present_id")
			defer cleanup()

			vehicle := &types.Vehicle{AgencyId: tc.Id}
			rules := &types.VehiclesRules{AgencyId: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.AgencyIdValidation(vehicle, tc.Row, gtfs, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		gtfs, cleanup := newAgencyGtfs(t, "A1")
		defer cleanup()

		vehicle := &types.Vehicle{AgencyId: lib.Ptr("A1")}
		rules := &types.VehiclesRules{AgencyId: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.AgencyIdValidation(vehicle, 1, gtfs, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})

	t.Run("Unknown_Agency_Is_Always_An_Error", func(t *testing.T) {
		services.AppMessageService.Clear()

		gtfs, cleanup := newAgencyGtfs(t, "A1")
		defer cleanup()

		vehicle := &types.Vehicle{AgencyId: lib.Ptr("A2")}
		rules := &types.VehiclesRules{AgencyId: types.RuleConfig{Severity: types.SEVERITY_WARNING}}

		validations.AgencyIdValidation(vehicle, 1, gtfs, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Unknown_Agency_Is_Always_An_Error", types.SEVERITY_ERROR)
	})
}
