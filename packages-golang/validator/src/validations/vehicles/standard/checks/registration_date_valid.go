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
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_registration_date_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("registration_date", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the registration_date value

	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("registration_date")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty registration_date values

	// Presence belongs to the field check.
	if value == "" {
		return nil
	}

	//
	// 5. Check if the registration_date is a valid service date

	if !lib.IsValidServiceDate(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 6. Return success

	return nil
}
