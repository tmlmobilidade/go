package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

func EligibilityUrlValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "rider_categories", []string{"eligibility_url"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "eligibility_url")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty eligibility_url values

		if value == "" {
			return nil
		}

		//
		// 3. Check if the eligibility_url is a valid URL

		if !validators.ValidateUrl(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid"))
		}

		//
		// 4. Return success

		return nil
	})
}
