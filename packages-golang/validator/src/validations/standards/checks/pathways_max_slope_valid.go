package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: [max_slope, pathway_mode]
  - Presence: Optional, Required
  - Type: Float, Enum

# Description

  - max_slope: Maximum slope ratio along the pathway: positive uphill, negative downhill or 0 or empty for no slope.
    Applicable to walkways and moving sidewalks, identified by pathway_mode values 1 and 3.
  - pathway_mode: Type of connection: 1 walkway, 2 stairs, 3 moving sidewalk, 4 escalator, 5 elevator, 6 fare gate or
    7 exit gate.

Validation: Checks the pathway mode rather than parsing the slope. Modes 1 and 3 accept any populated slope text;
other integer modes allow only the exact text 0 or an empty value. An unreadable mode skips this comparison. Empty
values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
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
