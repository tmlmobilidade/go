package frequencies_standard

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
func TripIdValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "frequencies_trip_id_references_trips_table"
	ctx := lib.NewValidationContext("trip_id", "frequencies.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Frequencies.Field("trip_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	table, err := db.Table("trips")
	if err != nil {
		return err
	}
	exists, err := table.Exists("trip_id", value)
	if err != nil {
		return err
	}
	if !exists {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
	}
	return nil
}
