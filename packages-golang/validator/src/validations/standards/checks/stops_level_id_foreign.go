package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [stops.txt], [levels.txt]
  - Field: level_id
  - Presence: Optional
  - Type: Foreign ID referencing levels.level_id

# Description

Identifies the level on which the location is situated. A level can be shared by stations that are not connected.

Validation: Checks that each non-empty level_id exists in levels.level_id. It compares the original text without
trimming whitespace or normalizing letter case. The presence of the referenced value is separate from its format.
Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard stops].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[levels.txt]: https://gtfs.org/documentation/schedule/reference/#levelstxt
[GTFS Standard stops]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func LevelIdForeign(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "stops", "levels")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "stops", []string{"level_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "level_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Validate the level_id is a foreign key

		referenceExists1, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "levels"}, "level_id", value)
		if err != nil {
			return err
		}
		if !referenceExists1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
