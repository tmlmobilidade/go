package vehicles_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_emission_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("emission", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the emission value

	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("emission")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty emission values

	// Presence belongs to the field check.
	if value == "" {
		return nil
	}

	//
	// 5. Get the valid emission options

	validOptions := []string{"Euro I", "Euro II", "Euro III", "Euro IV", "Euro V", "Euro VI", "Euro VII", "N/A"}

	//
	// 6. Check if the emission is a valid option

	if !slices.Contains(validOptions, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 7. Check the configured emission options

	if rules != nil && rules.Options != nil && !slices.Contains(*rules.Options, types.ALL_OPTIONS) && !slices.Contains(*rules.Options, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
	}

	//
	// 8. Return success

	return nil
}
