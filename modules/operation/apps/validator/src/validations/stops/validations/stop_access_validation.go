package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes

- File: [stops.txt]
- Field: stop_access
- Presence: Conditional Forbiddden
- Type: Enum

# Description

Indicates how the stop is accessed for a particular station. Valid options are:

0 - The stop/platform cannot be directly accessed from the street network. It must be accessed from a station entrance if there is one defined for the station, otherwise the station itself. If there are pathways defined for the station, they must be used to access the stop/platform.
1 - Consuming applications should generate directions for access directly to the stop, independent of any entrances or pathways of the parent station.

When stop_access is empty, the access for the specified stop or platform is considered undefined.

Conditionally Forbidden:
- Forbidden for locations which are stations (location_type=1), entrances (location_type=2), generic nodes (location_type=3) or boarding areas (location_type=4).
- Forbidden if parent_station is empty.
- Optional otherwise.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/

func StopAccessValidation(stop *types.Stop, row int, gtfs *types.Gtfs, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("stop_access", "stops.txt", "stop_access_validation", row, services.AppMessageService)
	if rules != nil && rules.StopAccess.Severity != "" {
		ctx.WithSeverity(rules.StopAccess.Severity)
	}

	if stop.StopAccess == nil {
		if ctx.ShouldIgnore() {
			return
		}

		message := ctx.GetRequiredMessage("stop_access_validation.required", "stop_access_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_access_validation.forbidden"))
		return
	}

	// check if parent_station is empty
	if stop.ParentStation == nil || *stop.ParentStation == "" {
		ctx.AddError(ctx.GetTranslatedMessage("stop_access_validation.forbidden_parent_station_empty"))
		return
	}

	// Get the stop to check location_type
	if stop.LocationType == nil {
		if ctx.ShouldSkip() {
			return
		}

		if *stop.LocationType != 0 {
			ctx.AddError(ctx.GetTranslatedMessage("stop_access_validation.forbidden_location_type_not_platform"))
			return
		}
		return
	}

	validOptions := []int{0, 1}
	if !slices.Contains(validOptions, *stop.StopAccess) {
		ctx.AddError(ctx.GetTranslatedMessage("stop_access_validation.invalid", *stop.StopAccess))
		return
	}

	// Validate Rule options
	if rules != nil && rules.StopAccess.Options != nil {
		if slices.Contains(*rules.StopAccess.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopAccess.Options, strconv.Itoa(*stop.StopAccess)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_access_validation.not_allowed", *stop.StopAccess))
			return
		}
	}
}
