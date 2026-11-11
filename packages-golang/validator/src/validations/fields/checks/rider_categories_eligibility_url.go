package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [rider_categories.txt]
  - Field: eligibility_url
  - Presence: Optional
  - Type: URL

# Description

Web page explaining the rider category and the conditions a passenger must meet to qualify for it.

[rider_categories.txt]: https://gtfs.org/documentation/schedule/reference/#rider_categoriestxt
*/
func EligibilityUrlField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "rider_categories", []string{"eligibility_url"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the eligibility_url value

		value, err := queries.Field(row.Source, "eligibility_url")
		if err != nil {
			return err
		}

		//
		// 3. Check if the eligibility_url is required

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
