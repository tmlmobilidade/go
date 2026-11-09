package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
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
func EmissionValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "vehicles", []string{"emission"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "emission")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty emission values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Get the valid emission options

		validOptions := []string{"Euro I", "Euro II", "Euro III", "Euro IV", "Euro V", "Euro VI", "Euro VII", "N/A"}

		//
		// 4. Check if the emission is a valid option

		if !slices.Contains(validOptions, value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 5. Check the configured emission options

		if config.Options != nil && !slices.Contains(*config.Options, variables.AllRuleOptions) && !slices.Contains(*config.Options, value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed", value))
		}

		//
		// 6. Return success

		return nil
	})
}
