package fare_media

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/fare_media/validations"
	"testing"
)

func TestAllGenericOptionsForFareMediaType(t *testing.T) {
	validOptions := []int{0, 1, 2, 3, 4}
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("fare_media_type", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var fareMediaType *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok && ptr != nil {
					fareMediaType = ptr
				}
			}
			fareMedia := &types.FareMedia{FareMediaType: fareMediaType}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"fare_media": map[string][]int{"FM1": {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.FareMediaTypeValidation(fareMedia, tc.Row, gtfs, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("Not_Allowed", func(t *testing.T) {
		services.AppMessageService.Clear()
		row := 1
		fareMedia := &types.FareMedia{FareMediaType: lib.Ptr(5)}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"fare_media": map[string][]int{"FM1": {1}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.FareMediaTypeValidation(fareMedia, row, gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Not_Allowed", types.SEVERITY_ERROR)
	})
}
