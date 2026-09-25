package fare_rules

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/fare_rules/validations"
	"testing"
)

func TestAllFareIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("fare_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var fareId *string
			if tc.Id != nil {
				fareId = tc.Id
			}

			gtfsIdMap := types.GtfsIdMap{}
			if tc.Name == "ForeignKey_Present" && fareId != nil {
				gtfsIdMap["fare_attributes"] = map[string][]int{*fareId: {1}}
			}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: gtfsIdMap}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.FareIdValidation(&types.FareRule{FareId: fareId}, tc.Row, gtfs, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
