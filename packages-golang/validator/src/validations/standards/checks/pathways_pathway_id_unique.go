package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [pathways.txt]
  - Field: pathway_id
  - Presence: Required
  - Type: Unique ID

# Description

Unique internal identifier for a pathway. Separate pathways can connect the same pair of locations.

Validation: Checks that each non-empty pathway_id occurs only once in pathways.txt. It compares the original text
without trimming whitespace or normalizing letter case. Empty values are skipped; required-field checks handle
absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
*/
func PathwayIdUnique(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"pathway_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "pathway_id")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty pathway_id values

		if value == "" {
			return nil
		}

		//
		// 3. Count matching pathway_id values

		_, count, err := queries.FieldWithCount(rowCtx.Source, "pathway_id")
		if err != nil {
			return err
		}

		//
		// 4. Check if the pathway_id is unique

		if count > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "duplicate", value))
		}

		//
		// 5. Return success

		return nil
	})
}
