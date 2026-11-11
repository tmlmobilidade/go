package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_phone
  - Presence: Optional
  - Type: Phone number

# Description

Customer service telephone number presented in the agency's usual local format. Dialable letters are allowed, but
unrelated descriptive text should not be included.

Validation: Checks for at least seven digits and the characters accepted by the phone validator after trimming
surrounding whitespace. The current character set also allows ASCII letters, hyphens, plus signs, colons and dollar
signs, but not parentheses. It does not verify that the number can be called. Empty values are skipped;
required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[agency.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/agency
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#agencytxt
*/
func AgencyPhoneValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "agency", []string{"agency_phone"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "agency_phone")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if agency_phone is valid

		if !validators.ValidatePhone(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
