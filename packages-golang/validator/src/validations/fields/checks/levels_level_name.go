package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [levels.txt]
  - Field: level_name
  - Presence: Optional
  - Type: Text

# Description

Name of the level displayed to riders inside the station or building.

[levels.txt]: https://gtfs.org/documentation/schedule/reference/#levelstxt
*/
func LevelNameField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "levels", []string{"level_name"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the level_name value

		value, err := queries.Field(row.Source, "level_name")
		if err != nil {
			return err
		}

		//
		// 3. Check if the level_name is required

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
