package trips

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestAllTripIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("trip_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			trip := &types.Trip{TripId: tc.Id}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": tc.ExistingIds}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.TripIdValidation(trip, tc.Row, gtfs)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
