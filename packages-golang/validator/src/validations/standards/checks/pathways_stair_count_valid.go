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
  - Presence: Optional
  - Type: Non-null integer

# Description

Number of stairs along the pathway. A positive value means walking up from from_stop_id to to_stop_id; a negative
value means walking down. Recommended for pathway_mode=2.

Validation: Checks for a base-ten unsigned integer between 0 and 65535 inclusive. Unlike the signed field
definition, the current validator rejects negative values and accepts zero. Empty values are skipped;
required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
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
