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
func AgencyLangValidation(db *services.SQLiteContext, rules *types.AgencyRules) error {
	ctx := lib.NewValidationContext("agency_lang", "agency.txt", "agency_lang_valid_language_tag", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyLang.Severity != "" {
		ctx.WithSeverity(rules.AgencyLang.Severity)
	}

	//
	// 1. Get the agency_lang value

	value, err := db.Agency.Field("agency_lang")
	if err != nil {
		return err
	}

	//
	// 2. Check if agency_lang is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 3. Check if agency_lang is forbidden

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 4. Check if agency_lang is valid

	if !lib.ValidateLanguage(value) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Validate rules

	if rules != nil && rules.AgencyLang.Options != nil {
		if slices.Contains(*rules.AgencyLang.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.AgencyLang.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 6. Return success

	return nil
}
