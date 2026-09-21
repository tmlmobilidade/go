package transfers_tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	transfers "main/validations/transfers/validations"
	"testing"
)

func TestAllParseTransfersTestCases(t *testing.T) {
	t.Run("ValidInput", func(t *testing.T) {
		services.AppMessageService.Clear()
		row := 1
		raw := &types.TransfersRaw{
			FromStopId:      "S1",
			ToStopId:        "S2",
			FromRouteId:     "R1",
			ToRouteId:       "R2",
			FromTripId:      "T1",
			ToTripId:        "T2",
			TransferType:    "1",
			MinTransferTime: "10",
		}
		transfers.ParseTransfers(raw, row, types.Gtfs{}, &types.TransfersRules{})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "ParseTransfers_ValidInput", types.SEVERITY_ERROR)
	})

	t.Run("InvalidInput", func(t *testing.T) {
		services.AppMessageService.Clear()
		row := 1
		raw := &types.TransfersRaw{
			FromStopId:      "S1",
			ToStopId:        "S2",
			FromRouteId:     "R1",
			ToRouteId:       "R2",
			FromTripId:      "T1",
			ToTripId:        "T2",
			TransferType:    "1",
			MinTransferTime: "invalid",
		}
		transfers.ParseTransfers(raw, row, types.Gtfs{}, &types.TransfersRules{})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "ParseTransfers_InvalidInput", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "ParseTransfers_InvalidInput", types.SEVERITY_WARNING)
	})
}
