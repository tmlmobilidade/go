package frequencies

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: trip_id
  - Presence: Required
  - Type: Foreign Key referencing trips.trip_id

# Description

Identifies a trip to which the specified headway of service applies.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func TripIdValidation(frequency *types.Frequencies, row int, gtfs *types.Gtfs, rules *types.FrequenciesRules) {
	ctx := lib.NewValidationContext("trip_id", "frequencies.txt", "frequencies_trip_id_references_trips_table", row, services.AppMessageService)
	if rules != nil && rules.TripId.Severity != "" {
		ctx.WithSeverity(rules.TripId.Severity)
	}

	// 1. Validate trip_id is present
	if frequency.TripId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate trip_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate trip_id is a valid trip_id
	if !lib.GtfsIdMapKeyExists(gtfs, "trips", *frequency.TripId) {
		ctx.AddError(ctx.GetTranslatedMessage("not_found", *frequency.TripId))
		return
	}
}
