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

Wheelchair accessibility of the vehicle, using the standard trips.wheelchair_accessible values.

Validation: Checks that the populated value represents an integer in 0, 1, 2. Matching uses the parsed integer
rather than its original spelling. Configured options can further restrict this set; all_options bypasses that
restriction, while an empty list rejects all populated values. Empty values are skipped; required-field checks
handle absence.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
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
