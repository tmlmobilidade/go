package trips

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestAllServiceIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("service_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var serviceId *string
			if tc.Id != nil {
				serviceId = lib.Ptr(*tc.Id)
			}
			trip := &types.Trip{ServiceId: serviceId}
			if tc.Name == "ForeignKey_Invalid" {
				trip = &types.Trip{}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"calendar": {*tc.Id: {1}}, "calendar_dates": {}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.ServiceIdValidation(trip, tc.Row, gtfs, make(map[string][]int), make(map[string][]int))
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("Required_Missing", func(t *testing.T) {
		services.AppMessageService.Clear()
		trip := &types.Trip{ServiceId: nil}
		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"calendar": {"service1": {1}}, "calendar_dates": {}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.ServiceIdValidation(trip, 1, gtfs, make(map[string][]int), make(map[string][]int))
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Service ID is required", types.SEVERITY_ERROR)
	})
}
