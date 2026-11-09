package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes
- File: [pathways.txt]
- Field: stair_count
- Presence: optional
- Type: non-null integer

# Description

Number of stairs in the pathway.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func StairCountValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"stair_count"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "stair_count")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty stair_count values

		if value == "" {
			return nil
		}

		//
		// 3. Check if the stair_count is a valid unsigned integer

		if _, err := strconv.ParseUint(value, 10, 16); err != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 4. Return success

		return nil
	})
}
