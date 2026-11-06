package custom

import (
	"strconv"
	"strings"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
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
func VehicleCodeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "vehicles")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "vehicles", []string{"vehicle_code", "vehicle_type"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Get the vehicle_code value

		// Read the current SQLite row, rather than a parsed snapshot.
		value, err := queries.Field(rowCtx.Source, "vehicle_code")
		if err != nil {
			return err
		}

		//
		// 3. Skip empty vehicle_code values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 4. Check if the vehicle_code has a valid format

		vehicleType, err := queries.Field(rowCtx.Source, "vehicle_type")
		if err != nil {
			return err
		}
		mode, _ := strconv.Atoi(vehicleType)
		valid := strings.TrimSpace(value) != ""
		switch mode {
		case 3, 11: // Bus and trolleybus.
			valid = validators.ValidateLicensePlate(value)
		case 4: // Ferry.
			valid = validators.ValidateMMSI(value)
		}
		// Missing or invalid vehicle_type is handled by its own config.
		if !valid {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 5. Count matching vehicle_code values

		table, err := validationutils.Table(rowCtx, "vehicles")
		if err != nil {
			return err
		}
		count := 0
		err = queries.ForEachMatchingFields(table, "vehicle_code", []any{value}, []string{"vehicle_type"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {
			if fields["vehicle_type"] == vehicleType {
				count++
			}
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 6. Check if the vehicle_code is unique

		if count > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "duplicate", value))
		}

		//
		// 7. Return success

		return nil
	})
}
