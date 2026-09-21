package transfers_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/transfers/validations"
	"testing"
)

func TestAllFromTripIdValidationTestCases(t *testing.T) {
	// Conditional required: only when transfer_type is 4 or 5
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("from_trip_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			severity := types.SEVERITY_ERROR
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			}

			var fromTripId *string
			if tc.Value != nil {
				fromTripId = tc.Value
			}

			// Required/Invalid_Value need transfer_type=4 to trigger required path
			// Recommended_Missing needs transfer_type=1 (optional) to trigger recommended path
			var transferType *int
			if tc.Name == "Required" || tc.Name == "Invalid_Value" {
				transferType = lib.Ptr(4)
			} else {
				transferType = lib.Ptr(1) // Optional - triggers recommended when missing
			}

			transfer := &types.Transfers{FromTripId: fromTripId, FromRouteId: nil, TransferType: transferType}

			var tripsIdMap map[string][]int
			if tc.Name == "ForeignKey_Invalid" || tc.Name == "Invalid_Value" {
				tripsIdMap = map[string][]int{}
			} else if fromTripId != nil && *fromTripId != "" {
				tripsIdMap = map[string][]int{*fromTripId: {0}}
			} else {
				tripsIdMap = map[string][]int{}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": tripsIdMap}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.FromTripIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{FromTripId: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	// Foreign key tests
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("from_trip_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var tripsIdMap map[string][]int
			if tc.Name == "ForeignKey_Invalid" {
				tripsIdMap = map[string][]int{}
			} else {
				tripsIdMap = map[string][]int{*tc.Id: {0}}
			}

			transfer := &types.Transfers{FromTripId: tc.Id, FromRouteId: nil, TransferType: lib.Ptr(1)}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": tripsIdMap}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.FromTripIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{FromTripId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	// Severity tests - need transfer_type=4 for required path (Error), transfer_type=1 for optional (Warning)
	for _, tc := range test_helpers.GetGenericSeverityTestCases("from_trip_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var transferType *int
			if tc.Name == "Severity_Error_Missing" {
				transferType = lib.Ptr(4) // Required when 4 or 5
			} else {
				transferType = lib.Ptr(1) // Optional - triggers recommended
			}

			transfer := &types.Transfers{FromTripId: nil, FromRouteId: nil, TransferType: transferType}

			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": map[string][]int{}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.FromTripIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{FromTripId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	// Trip must belong to route tests
	t.Run("Valid_FromTripId_And_FromRouteId_SameRoute", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{FromTripId: lib.Ptr("trip1"), FromRouteId: lib.Ptr("route1"), TransferType: lib.Ptr(1)}

		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": map[string][]int{"trip1": {0}}, "routes": map[string][]int{"route1": {0}}}, TableData: map[string][]map[string]string{"trips": {{"trip_id": "trip1", "route_id": "route1"}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()
		validations.FromTripIdValidation(transfer, 1, *gtfs, &types.TransfersRules{FromTripId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_FromTripId_And_FromRouteId_SameRoute", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_FromTripId_And_FromRouteId_SameRoute", types.SEVERITY_WARNING)
	})

	t.Run("Invalid_FromTripId_And_FromRouteId_TripBelongsToDifferentRoute", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{FromTripId: lib.Ptr("trip1"), FromRouteId: lib.Ptr("route1"), TransferType: lib.Ptr(1)}

		gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"trips": map[string][]int{"trip1": {0}}, "routes": map[string][]int{"route1": {0}, "route2": {1}}}, TableData: map[string][]map[string]string{"trips": {{"trip_id": "trip1", "route_id": "route2"}}}}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.FromTripIdValidation(transfer, 1, *gtfs, &types.TransfersRules{FromTripId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_FromTripId_And_FromRouteId_TripBelongsToDifferentRoute", types.SEVERITY_ERROR)
	})
}
