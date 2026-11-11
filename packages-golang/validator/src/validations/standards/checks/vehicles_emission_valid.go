package standard

import (
	"slices"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: emission
  - Presence: Required
  - Type: Enum

# Description

Emissions class applicable in the vehicle's operating territory. Accepted classes are Euro I through Euro VII, or
N/A when not applicable, such as for electric vehicles.

Validation: Checks that the populated value exactly matches one of Euro I, Euro II, Euro III, Euro IV, Euro V, Euro
VI, Euro VII, N/A. Whitespace and letter case are preserved. Configured options can further restrict this set;
all_options bypasses that restriction, while an empty list rejects all populated values. Empty values are skipped;
required-field checks handle absence.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func EmissionValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "vehicles", []string{"emission"}, func(rowCtx *contextTypes.ValidationContext) error {
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
