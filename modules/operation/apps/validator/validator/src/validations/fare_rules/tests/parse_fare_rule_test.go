package fare_rules

import (
	"main/lib"
	"main/services"
	"main/types"
	validations "main/validations/fare_rules/validations"
	"testing"
)

func TestParseFareRule_ValidInput(t *testing.T) {
	services.AppMessageService.Clear()
	rawFareRule := types.FareRuleRaw{
		FareId:        "FARE1",
		RouteId:       "ROUTE1",
		OriginId:      "ORIGIN1",
		DestinationId: "DEST1",
		ContainsId:    "CONTAIN1",
	}

	fareRule := validations.ParseFareRule(rawFareRule, 3)
	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Valid input should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
	if fareRule.FareId == nil || *fareRule.FareId != "FARE1" {
		t.Errorf("Expected FareId to be 'FARE1', got %v", fareRule.FareId)
	}
	if fareRule.RouteId == nil || *fareRule.RouteId != "ROUTE1" {
		t.Errorf("Expected RouteId to be 'ROUTE1', got %v", fareRule.RouteId)
	}
	if fareRule.OriginId == nil || *fareRule.OriginId != "ORIGIN1" {
		t.Errorf("Expected OriginId to be 'ORIGIN1', got %v", fareRule.OriginId)
	}
	if fareRule.DestinationId == nil || *fareRule.DestinationId != "DEST1" {
		t.Errorf("Expected DestinationId to be 'DEST1', got %v", fareRule.DestinationId)
	}
	if fareRule.ContainsId == nil || *fareRule.ContainsId != "CONTAIN1" {
		t.Errorf("Expected ContainsId to be 'CONTAIN1', got %v", fareRule.ContainsId)
	}
}

func TestParseFareRule_EmptyInput(t *testing.T) {
	services.AppMessageService.Clear()
	rawFareRule := types.FareRuleRaw{}
	fareRule := validations.ParseFareRule(rawFareRule, 3)

	if fareRule.FareId != nil {
		t.Errorf("Expected FareId to be nil, got %v", fareRule.FareId)
	}
	if fareRule.RouteId != nil {
		t.Errorf("Expected RouteId to be nil, got %v", fareRule.RouteId)
	}
	if fareRule.OriginId != nil {
		t.Errorf("Expected OriginId to be nil, got %v", fareRule.OriginId)
	}
	if fareRule.DestinationId != nil {
		t.Errorf("Expected DestinationId to be nil, got %v", fareRule.DestinationId)
	}
	if fareRule.ContainsId != nil {
		t.Errorf("Expected ContainsId to be nil, got %v", fareRule.ContainsId)
	}
}
