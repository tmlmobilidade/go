package fare_rules

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseFareRule(rawFareRule types.FareRuleRaw, row int) types.FareRule {
	var (
		fareRule                                             types.FareRule = types.FareRule{}
		fareId, routeId, originId, destinationId, containsId string
		messages                                             []types.Message
	)

	stringFields := map[string]*string{
		"fare_id":        &fareId,
		"route_id":       &routeId,
		"origin_id":      &originId,
		"destination_id": &destinationId,
		"contains_id":    &containsId,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:    field,
			FileName: "fare_rules.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: types.SEVERITY_ERROR,
			RuleID:   "fare_rules_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawFareRule, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return fareRule
	}

	fareRule.FareId = lib.IfThenElse(rawFareRule.FareId != "", &fareId, nil)
	fareRule.RouteId = lib.IfThenElse(rawFareRule.RouteId != "", &routeId, nil)
	fareRule.OriginId = lib.IfThenElse(rawFareRule.OriginId != "", &originId, nil)
	fareRule.DestinationId = lib.IfThenElse(rawFareRule.DestinationId != "", &destinationId, nil)
	fareRule.ContainsId = lib.IfThenElse(rawFareRule.ContainsId != "", &containsId, nil)

	return fareRule
}
