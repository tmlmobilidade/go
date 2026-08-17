package routes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestAllAgencyIdValidationTestCases(t *testing.T) {
	fieldName := "agency_id"

	for _, tc := range test_helpers.GetGenericForeignKeyTestCases(fieldName) {
		if tc.Name == "ForeignKey_Invalid" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"agency": map[string][]int{*tc.Id: {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.AgencyIdValidation(&types.Route{AgencyId: tc.Id}, tc.Row, *gtfs, &types.RoutesRules{AgencyId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("TestTableCountUpperThan2", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{TableCounts: map[string]int{"agency": 2}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.AgencyIdValidation(&types.Route{AgencyId: nil}, 1, *gtfs, &types.RoutesRules{AgencyId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Agency ID is required", types.SEVERITY_ERROR)
	})
	t.Run("TestTableCountEqual1", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{TableCounts: map[string]int{"agency": 1}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.AgencyIdValidation(&types.Route{AgencyId: nil}, 1, *gtfs, &types.RoutesRules{AgencyId: types.RuleConfig{Severity: types.SEVERITY_WARNING}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Agency ID is recommended", types.SEVERITY_WARNING)
	})
}
