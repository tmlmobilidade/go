package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [levels.txt]
  - Field: level_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a level within a station.

Validation: Checks that each non-empty level_id occurs only once in levels.txt. It compares the original text
without trimming whitespace or normalizing letter case. Empty values are skipped; required-field checks handle
absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[levels.txt]: https://gtfs.org/documentation/schedule/reference/#levelstxt
*/
func LevelIdUnique(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "levels", []string{"level_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "level_id")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty level_id values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Count matching level_id values

		_, count, err := queries.FieldWithCount(rowCtx.Source, "level_id")
		if err != nil {
			return err
		}

		//
		// 4. Check if the level_id is unique

		if count > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "duplicate", value))
		}

		//
		// 5. Return success

		return nil
	})
}
