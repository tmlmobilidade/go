package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: wheelchair_accessible
  - Presence: Required
  - Type: Enum

# Description

Accessibility status for wheelchairs of the vehicle, which follows the possible values of the wheelchair_accessible field from the trips.txt file.
Valid values are available in the official GTFS documentation.

Valid options are:

  - 0 - No accessibility information for the trip.
  - 1 - Vehicle being used on this particular trip can accommodate at least one rider in a wheelchair.
  - 2 - No riders in wheelchairs can be accommodated on this trip.

https://gtfs.org/documentation/schedule/reference/#:~:text=wheelchair_accessible
*/
func VehiclesWheelchairAccessibleValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_wheelchair_accessible_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("wheelchair_accessible", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the wheelchair_accessible value

	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("wheelchair_accessible")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty wheelchair_accessible values

	// Presence belongs to the field check.
	if value == "" {
		return nil
	}

	//
	// 5. Convert the wheelchair_accessible to an integer

	parsed, err := strconv.Atoi(value)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Get the valid wheelchair_accessible options

	validOptions := []int{0, 1, 2}

	//
	// 7. Check if the wheelchair_accessible is a valid option

	if !slices.Contains(validOptions, parsed) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 8. Check the configured wheelchair_accessible options

	if rules != nil && rules.Options != nil && !slices.Contains(*rules.Options, types.ALL_OPTIONS) && !slices.Contains(*rules.Options, strconv.Itoa(parsed)) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
	}

	//
	// 9. Return success

	return nil
}
