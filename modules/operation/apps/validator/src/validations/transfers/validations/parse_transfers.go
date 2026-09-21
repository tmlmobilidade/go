package transfers

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseTransfers(rawTransfers *types.TransfersRaw, row int, gtfs types.Gtfs, rules *types.TransfersRules) *types.Transfers {
	var (
		transfer                                                           *types.Transfers = &types.Transfers{}
		fromStopId, toStopId, fromRouteId, toRouteId, fromTripId, toTripId string
		transferType, minTransferTime                                      int
		messages                                                           []types.Message
	)

	stringFields := map[string]*string{
		"from_stop_id":  &fromStopId,
		"to_stop_id":    &toStopId,
		"from_route_id": &fromRouteId,
		"to_route_id":   &toRouteId,
		"from_trip_id":  &fromTripId,
		"to_trip_id":    &toTripId,
	}

	intFields := map[string]*int{
		"transfer_type":     &transferType,
		"min_transfer_time": &minTransferTime,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:        field,
			FileName:     "transfers.txt",
			Rows:         []int{row},
			Message:      msg,
			Severity:     types.SEVERITY_ERROR,
			RuleID:   "transfers_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(rawTransfers, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse int fields
	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(rawTransfers, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return nil
	}

	transfer.FromStopId = lib.IfThenElse(rawTransfers.FromStopId != "", &fromStopId, nil)
	transfer.ToStopId = lib.IfThenElse(rawTransfers.ToStopId != "", &toStopId, nil)
	transfer.FromRouteId = lib.IfThenElse(rawTransfers.FromRouteId != "", &fromRouteId, nil)
	transfer.ToRouteId = lib.IfThenElse(rawTransfers.ToRouteId != "", &toRouteId, nil)
	transfer.FromTripId = lib.IfThenElse(rawTransfers.FromTripId != "", &fromTripId, nil)
	transfer.ToTripId = lib.IfThenElse(rawTransfers.ToTripId != "", &toTripId, nil)
	transfer.TransferType = lib.IfThenElse(rawTransfers.TransferType != "", &transferType, nil)
	transfer.MinTransferTime = lib.IfThenElse(rawTransfers.MinTransferTime != "", &minTransferTime, nil)

	return transfer
}
