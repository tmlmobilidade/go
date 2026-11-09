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
- Presence: optional
- Type: non-negative float

# Description

Horizontal length in meters of the pathway from the origin location (defined in from_stop_id) to the destination location (defined in to_stop_id).

This field is recommended for walkways (pathway_mode=1), fare gates (pathway_mode=6) and exit gates (pathway_mode=7).

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
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
