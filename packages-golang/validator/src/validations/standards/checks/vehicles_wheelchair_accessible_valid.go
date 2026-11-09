package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
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
func VehiclesWheelchairAccessibleValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "vehicles", []string{"wheelchair_accessible"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "wheelchair_accessible")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty wheelchair_accessible values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Convert the wheelchair_accessible to an integer

		parsed, err := strconv.Atoi(value)
		if err != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Get the valid wheelchair_accessible options

		validOptions := []int{0, 1, 2}

		//
		// 5. Check if the wheelchair_accessible is a valid option

		if !slices.Contains(validOptions, parsed) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 6. Check the configured wheelchair_accessible options

		if config.Options != nil && !slices.Contains(*config.Options, variables.AllRuleOptions) && !slices.Contains(*config.Options, strconv.Itoa(parsed)) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed", value))
		}

		//
		// 7. Return success

		return nil
	})
}
