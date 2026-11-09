package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes

- File: [pathways.txt]
- Field: traversal_time
- Presence: optional
- Type: Positive integer

# Description

Time in seconds required to traverse the pathway from the origin location (defined in from_stop_id) to the destination location (defined in to_stop_id).

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func TraversalTimeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"traversal_time"}, func(rowCtx *context.ValidationContext) error {
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
