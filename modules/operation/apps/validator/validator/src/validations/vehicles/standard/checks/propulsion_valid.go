package vehicles_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: propulsion
  - Presence: Required
  - Type: Enum

# Description

The propulsion of the vehicle.

Valid options are:

  - 0 - Not applicable
  - 1 - Gasoline
  - 2 - Diesel
  - 3 - Auto LPG
  - 4 - Mixture
  - 5 - Electricity
  - 6 - Battery electric
  - 7 - Hybrid
  - 8 - Hydrogen
  - 9 - Biofuel
  - 10 - Biofuel / Biodiesel
  - 101 - Natural Gas
  - 102 - Natural Gas - CNG
  - 103 - Natural Gas - LNG
  - 104 - Aviation Fuel
  - 105 - Marine Fuel
  - 106 - Other
*/
func PropulsionValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "vehicles_propulsion_valid_enum"
	ctx := lib.NewValidationContext("propulsion", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("propulsion")
	if err != nil {
		return err
	}
	// Presence belongs to the field check.
	if value == "" {
		return nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	validOptions := []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 101, 102, 103, 104, 105, 106}
	if !slices.Contains(validOptions, parsed) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	if rules != nil && rules.Options != nil && !slices.Contains(*rules.Options, types.ALL_OPTIONS) && !slices.Contains(*rules.Options, strconv.Itoa(parsed)) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
	}
	return nil
}
