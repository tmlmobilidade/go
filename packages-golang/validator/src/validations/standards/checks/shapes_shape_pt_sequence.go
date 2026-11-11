package standard

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_pt_sequence
  - Presence: Required
  - Type: Non-negative integer

# Description

Non-negative sequence number defining how points connect along the shape. Values must increase but need not be
consecutive.

Validation: Checks that the populated value is an integer greater than or equal to zero. Empty values are skipped;
required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#shapestxt
*/
func ShapePtSequence(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "shapes", []string{"shape_pt_sequence"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "shape_pt_sequence")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the shape_pt_sequence is non-negative

		number, parseErr := strconv.Atoi(value)
		if parseErr != nil || number < 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid"))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
