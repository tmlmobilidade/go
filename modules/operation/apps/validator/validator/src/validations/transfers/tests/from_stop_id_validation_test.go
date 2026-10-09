package transfers_tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/transfers/validations"
	"testing"
)

func TestAllFromStopIdValidationTestCases(t *testing.T) {
	// Conditional required/recommended tests (transfer_type 1, 2, or 3 makes from_stop_id required)
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("from_stop_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			severity := types.SEVERITY_ERROR
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			}

			var fromStopId *string
			if tc.Value != nil {
				fromStopId = tc.Value
			}

			transfer := &types.Transfers{FromStopId: fromStopId, TransferType: lib.Ptr(1)}

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

			validations.FromStopIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{FromStopId: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	// Foreign key tests
	for _, tc := range test_helpers.GetGenericForeignKeyTestCases("from_stop_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			transfer := &types.Transfers{FromStopId: tc.Id, TransferType: lib.Ptr(1)}
			if tc.Name == "ForeignKey_Invalid" {
				transfer = &types.Transfers{FromStopId: nil, TransferType: lib.Ptr(1)}
			}
			gtfs, cleanup, err := test_helpers.MockGtfs{IdMapData: types.GtfsIdMap{"stops": map[string][]int{*tc.Id: {1}}}}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()
			validations.FromStopIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{FromStopId: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	// Severity tests (when from_stop_id is missing with different severity levels)
	for _, tc := range test_helpers.GetGenericSeverityTestCases("from_stop_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			transfer := &types.Transfers{FromStopId: nil, TransferType: lib.Ptr(1)}

			gtfs, cleanup, err := test_helpers.MockGtfs{
				IdMapData: types.GtfsIdMap{"stops": map[string][]int{}},
			}.ToGtfsWithDB()
			if err != nil {
				t.Fatalf("failed to create mock gtfs: %v", err)
			}
			defer cleanup()

			validations.FromStopIdValidation(transfer, tc.Row, *gtfs, &types.TransfersRules{FromStopId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	// Location type and transfer_type specific tests
	t.Run("Valid_Stop_LocationType0", func(t *testing.T) {
		services.AppMessageService.Clear()
		fromStopId := "S1"
		transfer := &types.Transfers{FromStopId: &fromStopId, TransferType: lib.Ptr(1)}

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

		validations.FromStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Stop_LocationType0", types.SEVERITY_ERROR)
	})

	t.Run("Valid_Station_LocationType1", func(t *testing.T) {
		services.AppMessageService.Clear()
		fromStopId := "S1"
		transfer := &types.Transfers{FromStopId: &fromStopId, TransferType: lib.Ptr(1)}

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

		validations.FromStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Station_LocationType1", types.SEVERITY_ERROR)
	})

	t.Run("Invalid_NotFound", func(t *testing.T) {
		services.AppMessageService.Clear()
		fromStopId := "S1"
		transfer := &types.Transfers{FromStopId: &fromStopId, TransferType: lib.Ptr(1)}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.FromStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_NotFound", types.SEVERITY_ERROR)
	})

	t.Run("Invalid_LocationType_Entrance", func(t *testing.T) {
		services.AppMessageService.Clear()
		fromStopId := "S1"
		transfer := &types.Transfers{FromStopId: &fromStopId, TransferType: lib.Ptr(1)}

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

		validations.FromStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_LocationType_Entrance", types.SEVERITY_ERROR)
	})

	t.Run("Invalid_Station_For_TransferType4", func(t *testing.T) {
		services.AppMessageService.Clear()
		fromStopId := "S1"
		transfer := &types.Transfers{FromStopId: &fromStopId, TransferType: lib.Ptr(4)}

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

		validations.FromStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_Station_For_TransferType4", types.SEVERITY_ERROR)
	})

	t.Run("Valid_Stop_For_TransferType4", func(t *testing.T) {
		services.AppMessageService.Clear()
		fromStopId := "S1"
		transfer := &types.Transfers{FromStopId: &fromStopId, TransferType: lib.Ptr(4)}

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

		validations.FromStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Stop_For_TransferType4", types.SEVERITY_ERROR)
	})

	t.Run("Optional_TransferType5_FromStopIdNil", func(t *testing.T) {
		services.AppMessageService.Clear()
		transfer := &types.Transfers{FromStopId: nil, TransferType: lib.Ptr(5)}

		gtfs, cleanup, err := test_helpers.MockGtfs{
			IdMapData: types.GtfsIdMap{"stops": map[string][]int{}},
		}.ToGtfsWithDB()
		if err != nil {
			t.Fatalf("failed to create mock gtfs: %v", err)
		}
		defer cleanup()

		validations.FromStopIdValidation(transfer, 1, *gtfs, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Optional_TransferType5_FromStopIdNil", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Optional_TransferType5_FromStopIdNil", types.SEVERITY_WARNING)
	})
}
