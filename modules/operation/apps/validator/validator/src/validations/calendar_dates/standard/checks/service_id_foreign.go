package calendar_dates_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [calendar_dates.txt]
  - Field: service_id
  - Presence: Required
  - Type: Foreign ID referencing calendar.service_id or ID
*/

func ServiceIdForeign(db *services.SQLiteContext, rules *types.CalendarDatesRules) error {
	//

	//
	// 1. Get the rule ID

	const ruleID = "calendar_dates_service_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("service_id", "calendar_dates.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the service_id value

	serviceId, err := db.CalendarDates.Field("service_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the service_id is foreign

	if !db.Calendar.Exists("service_id", serviceId) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", serviceId))
		return nil
	}

	//
	// 5. Return success

	return nil
}
