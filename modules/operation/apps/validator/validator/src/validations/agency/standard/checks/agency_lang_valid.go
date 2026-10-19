package agency_standard

import (
	"main/lib"
	"main/services"
	"main/types"
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
func AgencyLangValid(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_lang", "agency.txt", "agency_lang_valid", db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule("agency_lang_valid")
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 2. Get the agency_lang value

	value, err := db.Agency.Field("agency_lang")
	if err != nil {
		return err
	}

	//
	// 3. Check if agency_lang is valid

	if !lib.ValidateLanguage(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 4. Return success

	return nil
}
