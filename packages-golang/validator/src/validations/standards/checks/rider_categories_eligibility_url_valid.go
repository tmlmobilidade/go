package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
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

Validation: Checks for an HTTP or HTTPS URL with a host, valid percent escapes and no disallowed characters after
trimming surrounding whitespace. It does not fetch the page or apply configured value lists. Empty values are
skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[rider_categories.txt]: https://gtfs.org/documentation/schedule/reference/#rider_categoriestxt
*/
func EligibilityUrlValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "rider_categories", []string{"eligibility_url"}, func(rowCtx *contextTypes.ValidationContext) error {
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
