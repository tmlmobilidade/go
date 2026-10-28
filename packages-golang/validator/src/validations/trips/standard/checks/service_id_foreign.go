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
	//

	//
	// 1. Get the rule

	const ruleID = "trips_service_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("service_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the service_id value

	value, err := db.Trips.Field("service_id")
	if err != nil {
		return err
	}

	//
	// 4. Requiredness is checked by the field rule.

	if value == "" {
		return nil
	}

	//
	// 5. Check if the service_id exists in the calendar or calendar_dates table

	if !db.Calendar.Exists("service_id", value) && !db.CalendarDates.Exists("service_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
	}

	//
	// 6. Return success

	return nil
}
