package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
)

func EligibilityUrlField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "rider_categories", []string{"eligibility_url"}, func(row *context.ValidationContext) error {
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
