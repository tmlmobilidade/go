package agency

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/agency/validations"
	"testing"
)

func TestAgencyIdValidation(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("agency_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			agency := &types.Agency{AgencyId: tc.Id}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"agency": tc.ExistingIds}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.AgencyIdValidation(agency, tc.Row, *gtfs, &types.AgencyRules{AgencyId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("TableCountUpperThan2", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{TableCounts: map[string]int{"agency": 2}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.AgencyIdValidation(&types.Agency{AgencyId: nil}, 1, *gtfs, &types.AgencyRules{AgencyId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TableCountUpperThan2", types.SEVERITY_ERROR)
	})
	t.Run("TableCountEqual1", func(t *testing.T) {
		services.AppMessageService.Clear()
		gtfs, cleanup, err := test_helpers.MockGtfs{TableCounts: map[string]int{"agency": 1}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.AgencyIdValidation(&types.Agency{AgencyId: nil}, 1, *gtfs, &types.AgencyRules{AgencyId: types.RuleConfig{Severity: types.SEVERITY_WARNING}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "TableCountEqual1", types.SEVERITY_WARNING)
	})
}
