package routes

import (
	"main/lib"
	"main/services"
	"main/types"
	validations "main/validations/routes/validations"
	"testing"
)

func TestParseRoutes_InvalidTypes(t *testing.T) {
	services.AppMessageService.Clear()
	row := 2
	// route_type should be int, but is given as string
	input := types.RouteRaw{
		RouteId:   "R1",
		RouteType: "not_an_int",
	}
	_ = validations.ParseRoutes(input, row)
	assertion := lib.AssertionMessage{
		Expected: 1, // route_type parse error
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Invalid type for route_type should error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
}

func TestParseRoutes_ValidInput(t *testing.T) {
	services.AppMessageService.Clear()
	row := 3
	input := types.RouteRaw{
		RouteId:        "R1",
		RouteType:      "3",
		AgencyId:       "A1",
		RouteShortName: "10A",
		RouteLongName:  "Main Street",
		RouteColor:     "FFFFFF",
		RouteTextColor: "000000",
		RouteUrl:       "http://example.com",
		RouteSortOrder: "1",
	}
	route := validations.ParseRoutes(input, row)
	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Valid input should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
	// Additional checks for correct parsing
	if route.RouteId == nil || *route.RouteId != "R1" {
		t.Error("route_id not parsed correctly")
	}
	if route.RouteType == nil || *route.RouteType != 3 {
		t.Error("route_type not parsed correctly")
	}
	if route.AgencyId == nil || *route.AgencyId != "A1" {
		t.Error("agency_id not parsed correctly")
	}
	if route.RouteShortName == nil || *route.RouteShortName != "10A" {
		t.Error("route_short_name not parsed correctly")
	}
}
