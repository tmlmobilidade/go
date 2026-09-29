package stops

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_lat
  - Presence: Required
  - Type: Latitude

# Description

Latitude of the location.

For stops/platforms (location_type=0) and boarding area (location_type=4), the coordinates must be the ones of the bus pole — if exists — and otherwise of where the travelers are boarding the vehicle (on the sidewalk or the platform, and not on the roadway or the track where the vehicle stops).

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
// func StopLatValidation(stop *types.Stop, row int, rules *types.StopsRules, stopsData *types.StopsDataCache) {
func StopLatValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("stop_lat", "stops.txt", "stop_lat_valid_latitude_range", row, services.AppMessageService)
	if rules != nil && rules.StopLat.Severity != "" {
		ctx.WithSeverity(rules.StopLat.Severity)
	}

	// 1. Validate stop_lat is present
	if stop.StopLat == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("stop_lat_validation.required", "stop_lat_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate stop_lat is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_lat_validation.forbidden"))
		return
	}

	// 3. Validate stop_lat is a valid latitude
	if !lib.ValidateLatitude(*stop.StopLat) {
		ctx.AddError(ctx.GetTranslatedMessage("stop_lat_validation.invalid", *stop.StopLat))
		return
	}

	// // Check if stop_lat matches the pre-computed stops_data.json cache
	// ctx = lib.NewValidationContext("stop_lat", "stops.txt", "stop_lat_matches_stops_data", row, services.AppMessageService)
	// if rules != nil && rules.StopLatMatchesData.Severity != "" {
	// 	ctx.WithSeverity(rules.StopLatMatchesData.Severity)
	// }
	// if stop.StopId != nil && *stop.StopId != "" && stopsData != nil && len(stopsData.ByStopID) > 0 {
	// 	record, exists := stopsData.ByStopID[*stop.StopId]
	// 	if !exists {
	// 		return
	// 	}

	// 	if record.Latitude != *stop.StopLat {
	// 		if rules != nil && rules.StopLatMatchesData.Options != nil && len(*rules.StopLatMatchesData.Options) > 0 {
	// 			toleranceFloat, err := strconv.ParseFloat((*rules.StopLatMatchesData.Options)[0], 64)
	// 			if err == nil && math.Abs(record.Latitude-*stop.StopLat) <= toleranceFloat {
	// 				return
	// 			}
	// 		}
	// 		if ctx.ShouldSkip() {
	// 			return
	// 		}

	// 		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_lat_validation.does_not_match_stops_data", *stop.StopLat))
	// 		return
	// 	}
	// }

}
