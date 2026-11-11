package standard

import (
	"slices"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: vehicle_type
  - Presence: Required
  - Type: Enum

# Description

Transport mode of the vehicle, using the standard routes.route_type values.

Validation: Checks that the populated value represents an integer in 0, 1, 2, 3, 4, 5, 6, 7, 11, 12. Matching uses
the parsed integer rather than its original spelling. Configured options can further restrict this set; all_options
bypasses that restriction, while an empty list rejects all populated values. Empty values are skipped;
required-field checks handle absence.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func VehicleTypeValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "vehicles", []string{"vehicle_type"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "vehicle_type")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty vehicle_type values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Convert the vehicle_type to an integer

		parsed, err := strconv.Atoi(value)
		if err != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Get the valid vehicle_type options

		validOptions := []int{0, 1, 2, 3, 4, 5, 6, 7, 11, 12}

		//
		// 5. Check if the vehicle_type is a valid option

		if !slices.Contains(validOptions, parsed) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 6. Check the configured vehicle_type options

		if config.Options != nil && !slices.Contains(*config.Options, variables.AllRuleOptions) && !slices.Contains(*config.Options, strconv.Itoa(parsed)) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed", value))
		}

		//
		// 7. Return success

		return nil
	})
}
