package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

- File: [pathways.txt]
- Field: pathway_id
- Presence: Required
- Type:  unique ID

# Description

Identifies a pathway. Used by systems as an internal identifier for the record. Must be unique in the dataset.

Different pathways may have the same values for from_stop_id and to_stop_id.
Example: When two escalators are side-by-side in opposite directions, or when a stair set and elevator go from the same place to the same place, different pathway_id may have the same from_stop_id and to_stop_id values.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func PathwayIdUnique(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "pathways", []string{"pathway_id"}, func(rowCtx *context.ValidationContext) error {
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
