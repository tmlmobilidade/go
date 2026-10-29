package custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
 "strconv"
 "strings"
)

/*
# Attributes

- File: [vehicles.txt]
- Field: vehicle_code
- Presence: Required
- Type: String

# Description

A public identifier for the vehicle: a registration plate for road vehicles,
a maritime MMSI for ferries, or another identifier for other transport modes.
The code must be unique within its vehicle_type.
*/
func VehicleCodeValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_vehicle_code_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("vehicle_code", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the vehicle_code value

	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("vehicle_code")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty vehicle_code values

	// Presence belongs to the field check.
	if value == "" {
		return nil
	}

	//
	// 5. Check if the vehicle_code has a valid format

	vehicleType, err := db.Vehicles.Field("vehicle_type")
	if err != nil { return err }
	mode, _ := strconv.Atoi(vehicleType)
	valid := strings.TrimSpace(value) != ""
	switch mode {
	case 3, 11: // Bus and trolleybus.
		valid = lib.ValidateLicensePlate(value)
	case 4: // Ferry.
		valid = lib.ValidateMMSI(value)
	}
	// Missing or invalid vehicle_type is handled by its own rules.
	if !valid {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Count matching vehicle_code values

	table, err := db.Table("vehicles")
	if err != nil { return err }
	count := 0
	err = table.ForEachMatchingFields("vehicle_code", value, []string{"vehicle_type"}, func(_ *services.SQLiteRow, fields map[string]string) error {
		if fields["vehicle_type"] == vehicleType { count++ }
		return nil
	})
	if err != nil {
		return err
	}

	//
	// 7. Check if the vehicle_code is unique

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}

	//
	// 8. Return success

	return nil
}
