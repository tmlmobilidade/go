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

- File: [pathways.txt]
- Field: pathway_mode
- Presence: Required
- Type: Enum

# Description

Indicates the mode of transportation used in the pathway.

Valid options are:

  - 1: Walkway
  - 2: Stairs
  - 3: Moving sidewalk travelator
  - 4: Escalator
  - 5: Elevator
  - 6: Fare payment gate
  - 7: Exit gate

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func PathwayModeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"pathway_mode"}, func(rowCtx *context.ValidationContext) error {
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
