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
  - Field: location_type
  - Presence: Required
  - Type: Enum

# Description

Location type.

Valid options are:

  - 0 - Stop (or Platform). A location where passengers board or disembark from a transit vehicle. Is called a platform when defined within a parent_station.
  - 1 - Station. A physical structure or area that contains one or more platform.
  - 2 - Entrance/Exit. A location where passengers can enter or exit a station from the street. If an entrance/exit belongs to multiple stations, it may be linked by pathways to both, but the data provider must pick one of them as parent.
  - 3 - Generic Node. A location within a station, not matching any other location_type, that may be used to link together pathways defined in pathways.txt.
  - 4 - Boarding Area. A specific location on a platform, where passengers can board and/or alight vehicles.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func LocationTypeValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("location_type", "stops.txt", "stops_location_type_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.LocationType.Severity != "" {
		ctx.WithSeverity(rules.LocationType.Severity)
	}

	// 1. Validate location_type is present
	if stop.LocationType == nil {
		ctx.AddError(ctx.GetTranslatedMessage("required"))
		return
	}

	// 2. Validate location_type is a valid value
	validValues := []int{0, 1, 2, 3, 4}
	if !slices.Contains(validValues, *stop.LocationType) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", strconv.Itoa(*stop.LocationType)))
		return
	}

	// 3. Validate Rule options
	if rules != nil && rules.LocationType.Options != nil {
		if slices.Contains(*rules.LocationType.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.LocationType.Options, strconv.Itoa(*stop.LocationType)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *stop.LocationType))
			return
		}
	}
}
