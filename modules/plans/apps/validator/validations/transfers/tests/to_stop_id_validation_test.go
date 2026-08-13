package transfers_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/transfers/validations"
	"testing"
)

func TestAllToStopIdValidationTestCases(t *testing.T) {
	// Conditional required/recommended tests (transfer_type 1, 2, or 3 makes to_stop_id required)
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("to_stop_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			severity := types.SEVERITY_ERROR
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			}

			var toStopId *string
			if tc.Value != nil {
				toStopId = tc.Value
			}

			transfer := &types.Transfers{ToStopId: toStopId, TransferType: lib.Ptr(1)}

			var idMapData types.GtfsIdMap
			var tableData map[string][]map[string]string

			if tc.Name == "Valid_Present" {
				// Need stop to exist for foreign key and location_type validation
				idMapData = types.GtfsIdMap{"stops": map[string][]int{"valid_value": {0}}}
				tableData = map[string][]map[string]string{
					"stops": {{"stop_id": "valid_value", "location_type": "0"}},
				}
			} else {
				idMapData = types.GtfsIdMap{"stops": map[string][]int{}}
			}

			gtfs, cleanup, err := test_helpers.MockGtfs{
				IdMapData: idMapData,
				TableData: tableData,
			}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.ToStopIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{ToStopId: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	// Severity tests (when to_stop_id is missing with different severity levels)
	for _, tc := range test_helpers.GetGenericSeverityTestCases("to_stop_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			transfer := &types.Transfers{ToStopId: nil, TransferType: lib.Ptr(1)}

			gtfs, cleanup, err := test_helpers.MockGtfs{
				IdMapData: types.GtfsIdMap{"stops": map[string][]int{}},
			}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.ToStopIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{ToStopId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	// Location type and transfer_type specific tests
	t.Run("Valid_Stop_LocationType0", func(t *testing.T) {
		services.AppMessageService.Clear()
		toStopId := "S1"
		transfer := &types.Transfers{ToStopId: &toStopId, TransferType: lib.Ptr(1)}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{"S1": {0}}},
			TableData: map[string][]map[string]string{
				"stops": {{"stop_id": "S1", "location_type": "0"}},
			},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Stop_LocationType0", types.SEVERITY_ERROR)
	})

	t.Run("Valid_Station_LocationType1", func(t *testing.T) {
		services.AppMessageService.Clear()
		toStopId := "S1"
		transfer := &types.Transfers{ToStopId: &toStopId, TransferType: lib.Ptr(1)}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{"S1": {0}}},
			TableData: map[string][]map[string]string{
				"stops": {{"stop_id": "S1", "location_type": "1"}},
			},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Station_LocationType1", types.SEVERITY_ERROR)
	})

	t.Run("Invalid_NotFound", func(t *testing.T) {
		services.AppMessageService.Clear()
		toStopId := "S1"
		transfer := &types.Transfers{ToStopId: &toStopId, TransferType: lib.Ptr(1)}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_NotFound", types.SEVERITY_ERROR)
	})

	t.Run("Invalid_LocationType_Entrance", func(t *testing.T) {
		services.AppMessageService.Clear()
		toStopId := "S1"
		transfer := &types.Transfers{ToStopId: &toStopId, TransferType: lib.Ptr(1)}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{"S1": {0}}},
			TableData: map[string][]map[string]string{
				"stops": {{"stop_id": "S1", "location_type": "2"}},
			},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_LocationType_Entrance", types.SEVERITY_ERROR)
	})

	t.Run("Invalid_Station_For_TransferType4", func(t *testing.T) {
		services.AppMessageService.Clear()
		toStopId := "S1"
		transfer := &types.Transfers{ToStopId: &toStopId, TransferType: lib.Ptr(4)}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{"S1": {0}}},
			TableData: map[string][]map[string]string{
				"stops": {{"stop_id": "S1", "location_type": "1"}},
			},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_Station_For_TransferType4", types.SEVERITY_ERROR)
	})

	t.Run("Valid_Stop_For_TransferType4", func(t *testing.T) {
		services.AppMessageService.Clear()
		toStopId := "S1"
		transfer := &types.Transfers{ToStopId: &toStopId, TransferType: lib.Ptr(4)}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{"S1": {0}}},
			TableData: map[string][]map[string]string{
				"stops": {{"stop_id": "S1", "location_type": "0"}},
			},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Stop_For_TransferType4", types.SEVERITY_ERROR)
	})

	t.Run("Optional_TransferType5_ToStopIdNil", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{ToStopId: nil, TransferType: lib.Ptr(5)}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Optional_TransferType5_ToStopIdNil", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Optional_TransferType5_ToStopIdNil", types.SEVERITY_WARNING)
	})

	t.Run("Invalid_ToStopId_SameAsFromStopId", func(t *testing.T) {
		services.AppMessageService.Clear()
		toStopId := "S1"
		transfer := &types.Transfers{ToStopId: &toStopId, FromStopId: lib.Ptr("S1"), TransferType: lib.Ptr(1)}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{"S1": {0}}},
			TableData: map[string][]map[string]string{
				"stops": {{"stop_id": "S1", "location_type": "0"}},
			},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.ToStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_ToStopId_SameAsFromStopId", types.SEVERITY_ERROR)
	})
}
