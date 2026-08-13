package trips

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestAllRouteIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("route_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var routeId *string
			if tc.Id != nil {
				routeId = tc.Id
			}
			trip := &types.Trip{RouteId: routeId}
			if tc.Name == "ForeignKey_Invalid" {
				trip = &types.Trip{}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"routes": {*tc.Id: []int{1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.RouteIdValidation(trip, tc.Row, gtfs, make(map[string][]int))
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
