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

  - File: [pathways.txt]
  - Field: pathway_mode
  - Presence: Required
  - Type: Enum

# Description

Type of connection: 1 walkway, 2 stairs, 3 moving sidewalk, 4 escalator, 5 elevator, 6 fare gate or 7 exit gate.

Validation: Checks that the populated value represents an integer in 1, 2, 3, 4, 5, 6, 7. Matching uses the parsed
integer rather than its original spelling. Configured options can further restrict this set; all_options bypasses
that restriction, while an empty list rejects all populated values. Empty values are skipped; required-field checks
handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func PathwayModeValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"pathway_mode"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "pathway_mode")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty pathway_mode values

		if value == "" {
			return nil
		}

		//
		// 3. Convert the pathway_mode to an integer

		parsed, err := strconv.Atoi(value)

		//
		// 4. Check if the pathway_mode is a valid option

		if err != nil || !slices.Contains([]int{1, 2, 3, 4, 5, 6, 7}, parsed) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 5. Check the configured pathway_mode options

		if config.Options != nil {
			if slices.Contains(*config.Options, variables.AllRuleOptions) {
				return nil
			}
			if !slices.Contains(*config.Options, strconv.Itoa(parsed)) {
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed", strconv.Itoa(parsed)))
				return nil
			}
		}

		//
		// 6. Return success

		return nil
	})
}
