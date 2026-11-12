package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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

[levels.txt]: https://gtfs.org/documentation/schedule/reference/#levelstxt
*/
func LevelsLevelIdField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "levels", []string{"level_id"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the level_id value

		value, err := queries.Field(row.Source, "level_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the level_id is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
