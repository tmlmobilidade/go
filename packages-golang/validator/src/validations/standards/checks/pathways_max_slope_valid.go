package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes
- File: [pathways.txt]
- Field: max_slope
- Presence: optional
- Type: float

# Description

Maximum slope ratio of the pathway. Valid options are:

0 or empty - No slope.
Float - Slope ratio of the pathway, positive for upwards, negative for downwards.

This field should only be used with walkways (pathway_mode=1) and moving sidewalks (pathway_mode=3).

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func MaxSlopeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"max_slope", "pathway_mode"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "max_slope")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty max_slope values

		if value == "" {
			return nil
		}

		//
		// 3. Get the pathway_mode value

		modeValue, err := queries.Field(rowCtx.Source, "pathway_mode")
		if err != nil {
			return err
		}

		//
		// 4. Convert the pathway_mode to an integer

		mode, err := strconv.Atoi(modeValue)
		if err != nil {
			return nil
		}

		//
		// 5. Check if the pathway mode allows max_slope

		if mode != 1 && mode != 3 && value != "0" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed_pathway_mode", strconv.Itoa(mode)))
		}

		//
		// 6. Return success

		return nil
	})
}
