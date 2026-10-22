package vehicles_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: emission
  - Presence: Required
  - Type: Enum

# Description

The emission of the vehicle.

Valid options are:

  - Euro I
  - Euro II
  - Euro III
  - Euro IV
  - Euro V
  - Euro VI
  - Euro VII
  - N/A - Not applicable
*/
func EmissionValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "vehicles_emission_valid_enum"
	ctx := lib.NewValidationContext("emission", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("emission")
	if err != nil {
		return err
	}
	// Presence belongs to the field check.
	if value == "" {
		return nil
	}
	validOptions := []string{"Euro I", "Euro II", "Euro III", "Euro IV", "Euro V", "Euro VI", "Euro VII", "N/A"}
	if !slices.Contains(validOptions, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	if rules != nil && rules.Options != nil && !slices.Contains(*rules.Options, types.ALL_OPTIONS) && !slices.Contains(*rules.Options, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
	}
	return nil
}
