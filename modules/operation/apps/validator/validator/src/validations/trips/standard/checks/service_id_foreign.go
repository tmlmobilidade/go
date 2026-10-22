package trips_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: service_id
  - Presence: Required
  - Type: Foreign Key referencing calendar.service_id or calendar_dates.service_id

# Description

Identifies a service.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func ServiceIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "trips_service_id_references_calendar_service"
	ctx := lib.NewValidationContext("service_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Trips.Field("service_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	if !db.Calendar.Exists("service_id", value) && !db.CalendarDates.Exists("service_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
	}
	return nil
}
