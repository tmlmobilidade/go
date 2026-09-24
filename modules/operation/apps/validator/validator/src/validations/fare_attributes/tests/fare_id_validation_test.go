package fare_attributes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/fare_attributes/validations"
	"testing"
)

func TestAllFareIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("fare_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			fareAttribute := &types.FareAttribute{FareId: tc.Id}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"fare_attributes": tc.ExistingIds}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.FareIdValidation(fareAttribute, tc.Row, gtfs)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}

func TestFareIdUniquenessUsesFareAttributesOnly(t *testing.T) {
	for _, tc := range []struct {
		name           string
		ids            types.GtfsIdMap
		expectedErrors int
	}{
		{
			name:           "duplicate attributes without fare rules",
			ids:            types.GtfsIdMap{"fare_attributes": {"F1": {1, 2}}},
			expectedErrors: 1,
		},
		{
			name:           "duplicate attributes with one fare rule",
			ids:            types.GtfsIdMap{"fare_attributes": {"F1": {1, 2}}, "fare_rules": {"F1": {1}}},
			expectedErrors: 1,
		},
		{
			name: "unique attribute with repeated fare rules",
			ids:  types.GtfsIdMap{"fare_attributes": {"F1": {1}}, "fare_rules": {"F1": {1, 2}}},
		},
		{
			name: "unique attribute without fare rules",
			ids:  types.GtfsIdMap{"fare_attributes": {"F1": {1}}},
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			services.AppMessageService.Clear()
			t.Cleanup(services.AppMessageService.Clear)
			gtfs, cleanup, err := (test_helpers.MockGtfs{IdMapData: tc.ids}).ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			t.Cleanup(cleanup)
			fareID := "F1"
			validations.FareIdValidation(&types.FareAttribute{FareId: &fareID}, 1, gtfs)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.expectedErrors, tc.name, types.SEVERITY_ERROR)
		})
	}
}
