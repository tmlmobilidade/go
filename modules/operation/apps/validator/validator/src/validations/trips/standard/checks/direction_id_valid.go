package trips_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: direction_id
  - Presence: Required
  - Type: Enum

# Description

Indicates the direction of travel for a trip.
This field should not be used in routing; it provides a way to separate trips by direction when publishing time tables.

Valid options are:

  - 0 - Travel in one direction (e.g. outbound travel).
  - 1 - Travel in the opposite direction (e.g. inbound travel).

# Example

The `trip_headsign` and `direction_id` fields may be used together to assign a name to travel in each direction for a set of trips. A `trips.txt` file could contain these records for use in time tables:

	trip_id,...,trip_headsign,direction_id
	1234,...,Airport,0
	1505,...,Downtown,1

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func DirectionIdValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "trips_direction_id_valid_enum"
	ctx := lib.NewValidationContext("direction_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Trips.Field("direction_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 0 || parsed > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
		return nil
	}
	if rules != nil && rules.Options != nil && !slices.Contains(*rules.Options, types.ALL_OPTIONS) && !slices.Contains(*rules.Options, strconv.Itoa(parsed)) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", strconv.Itoa(parsed)))
	}
	return nil
}
