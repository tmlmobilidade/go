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
- Field: is_bidirectional
- Presence: Required
- Type: Enum

# Description

Indicates whether the pathway is bidirectional.

Valid options are:

	0 - Unidirectional pathway that can only be used from from_stop_id to to_stop_id.
	1 - Bidirectional pathway that can be used in both directions.

Exit gates (pathway_mode=7) must not be bidirectional.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func IsBidirectionalValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"is_bidirectional", "pathway_mode"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "is_bidirectional")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty is_bidirectional values

		if value == "" {
			return nil
		}

		//
		// 3. Convert the is_bidirectional to an integer

		parsed, err := strconv.Atoi(value)

		//
		// 4. Check if the is_bidirectional is a valid option

		if err != nil || !slices.Contains([]int{0, 1}, parsed) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 5. Check the configured is_bidirectional options

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
		// 6. Get the pathway_mode value

		modeValue, err := queries.Field(rowCtx.Source, "pathway_mode")
		if err != nil {
			return err
		}

		//
		// 7. Convert the pathway_mode to an integer

		mode, err := strconv.Atoi(modeValue)

		//
		// 8. Check if the exit gate is bidirectional

		if err == nil && parsed == 1 && mode == 7 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "exit_gate_bidirectional"))
		}

		//
		// 9. Return success

		return nil
	})
}
