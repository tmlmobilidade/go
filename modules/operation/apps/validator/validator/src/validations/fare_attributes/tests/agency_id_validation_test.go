package fare_attributes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/fare_attributes/validations"
	"testing"
)

// agency_id is only conditionally required: it is required (or recommended) only
// when the dataset has more than one agency. Every mock gtfs below therefore
// seeds the real "agency" table with two rows, so GetTableCount("agency") > 1
// and the required/recommended check actually triggers.
func agencyIdMockGtfs(t *testing.T, existingIds map[string][]int) (*types.Gtfs, func()) {
	t.Helper()
	gtfs, cleanup, err := test_helpers.MockGtfs{
		IdMapData: types.GtfsIdMap{"agency": existingIds},
		TableData: map[string][]map[string]string{
			"agency": {{"agency_id": "A1"}, {"agency_id": "A2"}},
		},
	}.ToGtfsWithDB()
	if err != nil {
		t.Fatalf("failed to create mock gtfs: %v", err)
	}
	return gtfs, cleanup
}

func TestAllAgencyIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("agency_id") {
		if tc.Name == "Duplicate_Id" || tc.Name == "Valid_Unique" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			agencyIdMap := make(map[string][]int)
			if tc.ExistingIds != nil {
				agencyIdMap = tc.ExistingIds
			}
			gtfs, cleanup := agencyIdMockGtfs(t, agencyIdMap)
			defer cleanup()
			validations.AgencyIdValidation(&types.FareAttribute{AgencyId: tc.Id}, tc.Row, gtfs, &types.FareAttributesRules{AgencyId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("agency_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			agencyId := &types.FareAttribute{AgencyId: tc.Value}

			agencyIdMap := make(map[string][]int)
			if tc.Value != nil && *tc.Value != "" {
				agencyIdMap[*tc.Value] = []int{1}
			}
			gtfs, cleanup := agencyIdMockGtfs(t, agencyIdMap)
			defer cleanup()
			validations.AgencyIdValidation(agencyId, tc.Row, gtfs, &types.FareAttributesRules{AgencyId: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
