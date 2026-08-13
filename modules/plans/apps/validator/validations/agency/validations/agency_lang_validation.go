package agency

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_lang
  - Presence: Optional
  - Type: Language Code

# Description

Primary language used by this transit agency.
Should be provided to help GTFS consumers choose capitalization rules and other language-specific settings for the dataset.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyLangValidation(agency *types.Agency, row int, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_lang", "agency.txt", "agency_lang_valid_language_tag", row, services.AppMessageService)
	if rules != nil && rules.AgencyLang.Severity != "" {
		ctx.WithSeverity(rules.AgencyLang.Severity)
	}

	// Check if agency_lang is required
	if agency.AgencyLang == nil && !ctx.ShouldIgnore() {
		message := ctx.GetRequiredMessage("agency_lang_validation.required", "agency_lang_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_lang_validation.forbidden"))
		return
	}

	// Check if agency_lang is valid
	if agency.AgencyLang != nil && !lib.ValidateLanguage(*agency.AgencyLang) {
		ctx.AddError(ctx.GetTranslatedMessage("agency_lang_validation.invalid"))
		return
	}

	// Validate rules
	if rules != nil && rules.AgencyLang.Options != nil {
		if slices.Contains(*rules.AgencyLang.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.AgencyLang.Options, *agency.AgencyLang) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_lang_validation.not_allowed", *agency.AgencyLang))
			return
		}
	}
}
