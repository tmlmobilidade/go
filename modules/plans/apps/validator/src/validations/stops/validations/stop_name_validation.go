/*
# Attributes

 - File: [stops.txt]
 - Field: stop_name
 - Presence: Conditionally Required
 - Type: String

# Description

Name of the location. The stop_name should match the agency's rider-facing name for the location as printed on a timetable, published online, or represented on signage. For translations into other languages, use [translations.txt].

When the location is a boarding area (location_type=4), the stop_name should contains the name of the boarding area as displayed by the agency. It could be just one letter (like on some European intercity railway stations), or text like "Wheelchair boarding area" (NYC's Subway) or "Head of short trains" (Paris' RER).

Conditionally Required:

  - Required for locations which are stops (location_type=0), stations (location_type=1) or entrances/exits (location_type=2).
  - Optional for locations which are generic nodes (location_type=3) or boarding areas (location_type=4).

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
[translations.txt]: https://gtfs.org/schedule/reference/#translationstxt
*/

package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

// StopNameValidation validates the presence of stop_name in stops.txt according to location_type
// func StopNameValidation(stop *types.Stop, row int, rules *types.StopsRules, stopsData *types.StopsDataCache) {
func StopNameValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("stop_name", "stops.txt", "stop_name_required_by_location_type", row, services.AppMessageService)
	if rules != nil && rules.StopName.Severity != "" {
		ctx.WithSeverity(rules.StopName.Severity)
	}

	isPresent := stop.StopName != nil && *stop.StopName != ""

	if !isPresent {
		locationType := -1
		if stop.LocationType != nil {
			locationType = *stop.LocationType
		}

		if locationType == 0 || locationType == 1 || locationType == 2 {
			ctx.AddError(ctx.GetTranslatedMessage("stop_short_name_validation.required_location_type"))
			return
		}

		if !ctx.ShouldIgnore() {
			message := ctx.GetRequiredMessage("stop_short_name_validation.required", "stop_short_name_validation.recommended")
			ctx.AddMessageWithSeverity(message)
			return
		}

		return
	}

	if rules != nil && rules.StopName.Options != nil {
		if slices.Contains(*rules.StopName.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopName.Options, *stop.StopName) {
			ctx.AddError(ctx.GetTranslatedMessage("stop_short_name_validation.not_allowed", *stop.StopName))
			return
		}
	}

	// // Check if stop_name matches the pre-computed stops_data.json cache
	// ctx = lib.NewValidationContext("stop_name", "stops.txt", "stop_name_matches_stops_data", row, services.AppMessageService)
	// if rules != nil && rules.StopNameMatchesData.Severity != "" {
	// 	ctx.WithSeverity(rules.StopNameMatchesData.Severity)
	// }
	// if stop.StopId != nil && *stop.StopId != "" && stopsData != nil && len(stopsData.ByStopID) > 0 {
	// 	record, exists := stopsData.ByStopID[*stop.StopId]
	// 	if !exists {
	// 		return
	// 	}

	// 	if record.Name != *stop.StopName {
	// 		if ctx.ShouldSkip() {
	// 			return
	// 		}

	// 		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_name_validation.does_not_match_stops_data", *stop.StopName))
	// 		return
	// 	}
	// }
}
