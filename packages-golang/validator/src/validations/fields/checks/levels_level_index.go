package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [levels.txt]
  - Field: level_index
  - Presence: Required
  - Type: Float

# Description

Relative vertical position of the level. Ground level is 0, higher levels use positive values and underground
levels use negative values.

[levels.txt]: https://gtfs.org/documentation/schedule/reference/#levelstxt
*/
func LevelIndexField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "levels", []string{"level_index"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the level_index value

		value, err := queries.Field(row.Source, "level_index")
		if err != nil {
			return err
		}

		//
		// 3. Check if the level_index is required

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
