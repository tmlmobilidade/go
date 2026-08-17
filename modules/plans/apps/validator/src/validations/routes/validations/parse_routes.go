package routes

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseRoutes(rawRoute types.RouteRaw, row int) types.Route {
	var (
		route                                                                                                                                   types.Route = types.Route{}
		routeId                                                                                                                                 string
		routeType                                                                                                                               int
		agencyId, continuousDropOff, continuousPickup, routeColor, routeDesc, routeLongName, routeShortName, routeTextColor, routeUrl, pathType string
		routeSortOrder                                                                                                                          int
		messages                                                                                                                                []types.Message
	)

	stringFields := map[string]*string{
		"route_id":            &routeId,
		"agency_id":           &agencyId,
		"continuous_drop_off": &continuousDropOff,
		"continuous_pickup":   &continuousPickup,
		"route_color":         &routeColor,
		"route_desc":          &routeDesc,
		"route_long_name":     &routeLongName,
		"route_short_name":    &routeShortName,
		"route_text_color":    &routeTextColor,
		"route_url":           &routeUrl,
		"path_type":           &pathType,
	}

	intFields := map[string]*int{
		"route_type":       &routeType,
		"route_sort_order": &routeSortOrder,
	}

	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:    field,
			FileName: "routes.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: types.SEVERITY_ERROR,
			RuleID:   "routes_values_parse",
		})
	}

	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawRoute, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawRoute, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return route
	}

	route.RouteId = lib.IfThenElse(rawRoute.RouteId != "", &routeId, nil)
	route.RouteType = lib.IfThenElse(rawRoute.RouteType != "", &routeType, nil)
	route.AgencyId = lib.IfThenElse(rawRoute.AgencyId != "", &agencyId, nil)
	route.ContinuousDropOff = lib.IfThenElse(rawRoute.ContinuousDropOff != "", &continuousDropOff, nil)
	route.ContinuousPickup = lib.IfThenElse(rawRoute.ContinuousPickup != "", &continuousPickup, nil)
	route.RouteColor = lib.IfThenElse(rawRoute.RouteColor != "", &routeColor, nil)
	route.RouteDesc = lib.IfThenElse(rawRoute.RouteDesc != "", &routeDesc, nil)
	route.RouteLongName = lib.IfThenElse(rawRoute.RouteLongName != "", &routeLongName, nil)
	route.RouteShortName = lib.IfThenElse(rawRoute.RouteShortName != "", &routeShortName, nil)
	route.RouteSortOrder = lib.IfThenElse(rawRoute.RouteSortOrder != "", &routeSortOrder, nil)
	route.RouteTextColor = lib.IfThenElse(rawRoute.RouteTextColor != "", &routeTextColor, nil)
	route.RouteUrl = lib.IfThenElse(rawRoute.RouteUrl != "", &routeUrl, nil)
	route.PathType = lib.IfThenElse(rawRoute.PathType != "", &pathType, nil)

	return route
}
