package routes

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

- File: [routes.txt]
- Field: route_url
- Presence: Optional
- Type: URL

# Description

URL of a web page about the particular route. Should be different from the agency.agency_url value.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func RouteUrlValidation(route *types.Route, row int, gtfs *types.Gtfs, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("route_url", "routes.txt", "route_url_valid_http_url", row, services.AppMessageService)
	if rules != nil && rules.RouteUrl.Severity != "" {
		ctx.WithSeverity(rules.RouteUrl.Severity)
	}

	// Check if route_url is required
	if route.RouteUrl == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("route_url_validation.required", "route_url_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// Check if route_url is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_url_validation.forbidden"))
		return
	}

	// Check if route_url is valid
	if !lib.ValidateUrl(*route.RouteUrl) {
		ctx.AddError(ctx.GetTranslatedMessage("route_url_validation.invalid", *route.RouteUrl))
		return
	}

	// Check if route_url is the same as agency.agency_url
	if route.AgencyId != nil {
		agencyId := *route.AgencyId
		agencyRows, err := gtfs.GetRowsById("agency", agencyId)
		if err == nil && len(agencyRows) > 1 {
			ctx.AddError(ctx.GetTranslatedMessage("route_url_validation.duplicate"))
			return
		}

		agencyRaw, err := gtfs.GetAgency(agencyRows[0])
		if err == nil && agencyRaw.AgencyUrl != "" && *route.RouteUrl == agencyRaw.AgencyUrl {
			ctx.AddError(ctx.GetTranslatedMessage("route_url_validation.same_as_agency_url"))
		}
	}

	// Validate rules
	if rules != nil && rules.RouteUrl.Options != nil {
		if slices.Contains(*rules.RouteUrl.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.RouteUrl.Options, *route.RouteUrl) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_url_validation.not_allowed", *route.RouteUrl))
			return
		}
	}
}
