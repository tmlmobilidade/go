package tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllAgencyIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("agency_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			vehicle := &types.Vehicle{AgencyId: tc.Id}

			if tc.Name == "ForeignKey_Invalid" {
				vehicle = &types.Vehicle{AgencyId: lib.Ptr("invalid")}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"agency": map[string][]int{*tc.Id: {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.AgencyIdValidation(vehicle, tc.Row, gtfs, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("Required_Agency_Id_Missing", func(t *testing.T) {
		services.AppMessageService.Clear()
		vehicle := &types.Vehicle{AgencyId: nil}
		validations.AgencyIdValidation(vehicle, 1, nil, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Required Agency ID is missing", types.SEVERITY_ERROR)
	})
}
