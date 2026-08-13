package stops

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_lon
  - Presence: Conditionally Required
  - Type: Lonitude

# Description

Longitude of the location.

For stops/platforms (location_type=0) and boarding area (location_type=4), the coordinates must be the ones of the bus pole — if exists — and otherwise of where the travelers are boarding the vehicle (on the sidewalk or the platform, and not on the roadway or the track where the vehicle stops).

Conditionally Required:
  - Required for locations which are stops (location_type=0), stations (location_type=1) or entrances/exits (location_type=2).
  - Optional for locations which are generic nodes (location_type=3) or boarding areas (location_type=4).

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
// func StopLonValidation(stop *types.Stop, row int, rules *types.StopsRules, stopsData *types.StopsDataCache) {
func StopLonValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("stop_lon", "stops.txt", "stop_lon_valid_longitude_range", row, services.AppMessageService)
	if rules != nil && rules.StopLon.Severity != "" {
		ctx.WithSeverity(rules.StopLon.Severity)
	}

	locationType := -1
	if stop.LocationType != nil {
		locationType = *stop.LocationType
	}

	isRequired := locationType == 0 || locationType == 1 || locationType == 2

	if stop.StopLon == nil {
		if isRequired {
			ctx.AddError(ctx.GetTranslatedMessage("stop_lon_validation.required_location_type"))
			return
		}

		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("stop_lon_validation.required", "stop_lon_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if !lib.ValidateLongitude(*stop.StopLon) {
		ctx.AddError(ctx.GetTranslatedMessage("stop_lon_validation.invalid", *stop.StopLon))
		return
	}

	// // Check if stop_lon matches the pre-computed stops_data.json cache
	// ctx = lib.NewValidationContext("stop_lon", "stops.txt", "stop_lon_matches_stops_data", row, services.AppMessageService)
	// if rules != nil && rules.StopLonMatchesData.Severity != "" {
	// 	ctx.WithSeverity(rules.StopLonMatchesData.Severity)
	// }
	// if stop.StopId != nil && *stop.StopId != "" && stopsData != nil && len(stopsData.ByStopID) > 0 {
	// 	record, exists := stopsData.ByStopID[*stop.StopId]
	// 	if !exists {
	// 		return
	// 	}

	// 	if record.Longitude != *stop.StopLon {
	// 		if rules != nil && rules.StopLonMatchesData.Options != nil && len(*rules.StopLonMatchesData.Options) > 0 {
	// 			toleranceFloat, err := strconv.ParseFloat((*rules.StopLonMatchesData.Options)[0], 64)
	// 			if err == nil && math.Abs(record.Longitude-*stop.StopLon) <= toleranceFloat {
	// 				return
	// 			}
	// 		}
	// 		if ctx.ShouldSkip() {
	// 			return
	// 		}

	// 		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_lon_validation.does_not_match_stops_data", *stop.StopLon))
	// 		return
	// 	}
	// }
}
