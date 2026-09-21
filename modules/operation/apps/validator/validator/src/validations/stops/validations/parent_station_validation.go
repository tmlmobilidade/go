package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: parent_station
  - Presence: Optional
  - Type: Foreign ID referencing stops.stop_id

# Description

Defines hierarchy between the different locations defined in stops.txt.

It contains the ID of the parent location, as follows:

  - Stop/platform (location_type=0): the parent_station field contains the ID of a station.
  - Station (location_type=1): this field must be empty.
  - Entrance/exit (location_type=2) or generic node (location_type=3): the parent_station field contains the ID of a station (location_type=1)
  - Boarding Area (location_type=4): the parent_station field contains ID of a platform.

Conditionally Required:

  - Required for locations which are entrances (location_type=2), generic nodes (location_type=3) or boarding areas (location_type=4).
  - Optional for stops/platforms (location_type=0).
  - Forbidden for stations (location_type=1).

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func ParentStationValidation(stop *types.Stop, row int, gtfs types.Gtfs, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("parent_station", "stops.txt", "parent_station_id_valid_for_stop_hierarchy", row, services.AppMessageService)
	if rules != nil && rules.ParentStation.Severity != "" {
		ctx.WithSeverity(rules.ParentStation.Severity)
	}

	locationType := 0
	if stop.LocationType != nil {
		locationType = *stop.LocationType
	}

	// Handle Nil Parent Station
	if stop.ParentStation == nil {

		// Handle Severity
		if !ctx.ShouldIgnore() {
			message := ctx.GetRequiredMessage("parent_station_validation.required", "parent_station_validation.recommended")
			ctx.AddMessageWithSeverity(message)
			return
		}

		// Allow nil parent_station for location_type=0 (Stop/Platform)
		if locationType == 0 || locationType == 1 {
			return
		}
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("parent_station_validation.forbidden"))
		return
	}

	// Validate Parent Station for Location Type 1 (Station)
	if locationType == 1 && stop.ParentStation != nil {
		ctx.AddError(ctx.GetTranslatedMessage("parent_station_validation.forbidden"))
		return
	}

	// Validate Parent Station for Location Type 2 (Entrance/Exit), 3 (Generic Node), or 4 (Boarding Area)
	if (locationType == 2 || locationType == 3 || locationType == 4) && stop.ParentStation == nil {
		ctx.AddError(ctx.GetTranslatedMessage("parent_station_validation.required_location_type"))
		return
	}

	// Validate Foreign Key
	if !lib.GtfsIdMapKeyExists(&gtfs, "stops", *stop.ParentStation) {
		ctx.AddError(ctx.GetTranslatedMessage("parent_station_validation.not_found", *stop.ParentStation))
		return
	}

	// Validate rules
	if rules != nil && rules.ParentStation.Options != nil {
		if slices.Contains(*rules.ParentStation.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ParentStation.Options, *stop.ParentStation) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("parent_station_validation.not_allowed", *stop.ParentStation))
			return
		}
	}
}
