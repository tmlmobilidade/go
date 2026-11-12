package custom

import (
	"strconv"
	"strings"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: [vehicle_code, vehicle_type]
  - Presence: Required
  - Type: Unique ID, Enum

# Description

Validates a public-facing vehicle code for its transport mode and detects repeated codes within the same type.

Validation: Skips an empty vehicle_code. Parsed vehicle types 3 and 11 require a Portuguese registration-plate
pattern; type 4 requires a nine-digit MMSI starting with a digit from 2 through 7. Other types, including
unreadable type text, require only non-whitespace code text. Plate validation uppercases and removes common
separators, including hyphens, spaces, dots and underscores; MMSI validation trims only surrounding whitespace.
After format validation, reports a duplicate only when the original vehicle_code and original vehicle_type strings
both match another row. Neither value is normalized for duplicate detection. This check does not independently
validate vehicle_type or confirm a real-world registration.

Example: AA-12-BB is accepted for type 3; 263123456 is accepted for type 4. Textually different plate separators or
type spellings are not merged for duplicate detection.

Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [vehicles.txt].

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func VehicleCodeValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "vehicles")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "vehicles", []string{"vehicle_code", "vehicle_type"}, func(rowCtx *contextTypes.ValidationContext) error {
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
