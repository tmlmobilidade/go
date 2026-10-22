package vehicles_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: registration_date
  - Presence: Required
  - Type: Date

# Description

Date the vehicle was first registered, in any location.
It is often used to determine the vehicle's age. In the numeric format yyyymmdd.
*/
func RegistrationDateValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "vehicles_registration_date_valid_day_granularity"
	ctx := lib.NewValidationContext("registration_date", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("registration_date")
	if err != nil {
		return err
	}
	// Presence belongs to the field check.
	if value == "" {
		return nil
	}
	if !lib.IsValidServiceDate(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}
	return nil
}
