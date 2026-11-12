package standard

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: traversal_time
  - Presence: Optional
  - Type: Positive integer

# Description

Average positive number of seconds needed to travel from from_stop_id to to_stop_id. Recommended for moving
sidewalks, escalators and elevators, identified by pathway_mode values 3, 4 and 5.

Validation: Checks that the populated value is an integer greater than or equal to zero. The current validator
accepts zero even though the standard field type is positive. Empty values are skipped; required-field checks
handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func TraversalTimeValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"traversal_time"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "traversal_time")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty traversal_time values

		if value == "" {
			return nil
		}

		//
		// 3. Convert the traversal_time to an integer

		parsed, err := strconv.Atoi(value)
		if err != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Check if the traversal_time is non-negative

		if parsed < 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "negative", strconv.Itoa(parsed)))
		}

		//
		// 5. Return success

		return nil
	})
}
