package pathways

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParsePathways(rawPathways types.PathwaysRaw, row int) types.Pathways {
	var (
		pathways                                                                                types.Pathways = types.Pathways{}
		fromStopId, toStopId, pathwayId, signpostedAs, reversedSignpostedAs, maxSlope, minWidth string
		pathwayMode, isBidirectional, traversalTime                                             int
		length                                                                                  float32
		stairCount                                                                              uint16
		messages                                                                                []types.Message
	)

	stringFields := map[string]*string{
		"from_stop_id":           &fromStopId,
		"to_stop_id":             &toStopId,
		"pathway_id":             &pathwayId,
		"signposted_as":          &signpostedAs,
		"reversed_signposted_as": &reversedSignpostedAs,
		"max_slope":              &maxSlope,
		"min_width":              &minWidth,
	}

	intFields := map[string]*int{
		"pathway_mode":     &pathwayMode,
		"is_bidirectional": &isBidirectional,
		"traversal_time":   &traversalTime,
	}

	float32Fields := map[string]*float32{
		"length": &length,
	}

	uintFields := map[string]*uint16{
		"stair_count": &stairCount,
	}

	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:        field,
			FileName:     "pathways.txt",
			Rows:         []int{row},
			Message:      msg,
			Severity:     types.SEVERITY_ERROR,
			RuleID:       "pathways_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawPathways, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse int fields
	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawPathways, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse float fields
	for field, target := range float32Fields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawPathways, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse uint fields
	for field, target := range uintFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawPathways, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// If there are any errors, return an empty pathways
	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return pathways
	}

	// Required fields
	pathways.FromStopId = lib.IfThenElse(fromStopId != "", &fromStopId, nil)
	pathways.ToStopId = lib.IfThenElse(toStopId != "", &toStopId, nil)
	pathways.PathwayId = lib.IfThenElse(pathwayId != "", &pathwayId, nil)
	pathways.PathwayMode = lib.IfThenElse(pathwayMode != 0, &pathwayMode, nil)
	pathways.IsBidirectional = lib.IfThenElse(rawPathways.IsBidirectional != "", &isBidirectional, nil)

	// Optional fields
	pathways.SignpostedAs = lib.IfThenElse(signpostedAs != "", &signpostedAs, nil)
	pathways.ReversedSignpostedAs = lib.IfThenElse(reversedSignpostedAs != "", &reversedSignpostedAs, nil)
	pathways.Length = lib.IfThenElse(rawPathways.Length != "", &length, nil)
	pathways.MaxSlope = lib.IfThenElse(maxSlope != "", &maxSlope, nil)
	pathways.MinWidth = lib.IfThenElse(minWidth != "", &minWidth, nil)
	pathways.TraversalTime = lib.IfThenElse(rawPathways.TraversalTime != "", &traversalTime, nil)
	pathways.StairCount = lib.IfThenElse(rawPathways.StairCount != "", &stairCount, nil)

	return pathways
}
