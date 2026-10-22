package vehicles_custom

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [vehicles.txt]
- Field: license_plate
- Presence: Required
- Type: String

# Description

The license plate of the vehicle unit.

The license plate must be in the format XXXXXX. For the ferry transport mode the
MMSI is used instead, a 9 digit identifier starting with 2-7.
*/
func LicensePlateValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "vehicles_license_plate_format_per_market_rules"
	ctx := lib.NewValidationContext("license_plate", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("license_plate")
	if err != nil {
		return err
	}
	// Presence belongs to the field check.
	if value == "" {
		return nil
	}
	if !lib.ValidateLicensePlate(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	_, count, err := db.Vehicles.FieldWithCount("license_plate")
	if err != nil {
		return err
	}
	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}
	return nil
}
