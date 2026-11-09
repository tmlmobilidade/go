package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"math"
	"strconv"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: length
  - Presence: Optional
  - Type: Non-negative float

# Description

Horizontal pathway length in meters between from_stop_id and to_stop_id. Recommended for walkways, fare gates and
exit gates, identified by pathway_mode values 1, 6 and 7.

Validation: Checks that the populated value is a finite number greater than or equal to zero. Empty values are
skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func LengthValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"length"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "length")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty length values

		if value == "" {
			return nil
		}

		//
		// 3. Convert the length to a float

		parsed, err := strconv.ParseFloat(value, 32)
		if err != nil || math.IsNaN(parsed) || math.IsInf(parsed, 0) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Check if the length is non-negative

		if parsed < 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "negative", float32(parsed)))
		}

		//
		// 5. Return success

		return nil
	})
}
