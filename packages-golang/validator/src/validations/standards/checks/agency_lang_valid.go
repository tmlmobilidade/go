package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_lang
  - Presence: Optional
  - Type: Language code

# Description

Primary language used by the agency, allowing consumers to select appropriate language-specific presentation rules.

Validation: Checks membership in the supported language-code list without distinguishing letter case. Surrounding
whitespace is not removed; regional tags are accepted only if listed. Configured value lists are not applied. Empty
values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[agency.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/agency
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#agencytxt
*/
func AgencyLangValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "agency", []string{"agency_lang"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "agency_lang")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if agency_lang is valid

		if !validators.ValidateLanguage(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
