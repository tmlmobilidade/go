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
- Field: wheelchair_accessible
- Presence: Optional
- Type: Enum

# Description

Indicates wheelchair accessibility. Valid options are:

  - 0 or empty - No accessibility information for the trip.
  - 1 - Vehicle being used on this particular trip can accommodate at least one rider in a wheelchair.
  - 2 - No riders in wheelchairs can be accommodated on this trip.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func WheelchairAccessibleValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "trips_wheelchair_accessible_valid_gtfs_enum"
	ctx := lib.NewValidationContext("wheelchair_accessible", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Trips.Field("wheelchair_accessible")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 0 || parsed > 2 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	if rules != nil && rules.Options != nil && !slices.Contains(*rules.Options, types.ALL_OPTIONS) && !slices.Contains(*rules.Options, strconv.Itoa(parsed)) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", strconv.Itoa(parsed)))
	}
	return nil
}
