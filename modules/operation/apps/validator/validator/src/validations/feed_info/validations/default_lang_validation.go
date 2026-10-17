package feed_info

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [feed_info.txt]
- Field: default_lang
- Presence: Optional
- Type: Language Code

# Description

Defines the language that should be used when the data consumer doesn't know the language of the rider. It will often be en (English).

[feed_info.txt]: https://gtfs.org/schedule/reference/#feed_infotxt
*/
func DefaultLangValidation(feedInfo *types.FeedInfo, row int, rules *types.FeedInfoRules) {
	ctx := lib.NewValidationContext("default_lang", "feed_info.txt", "feed_info_default_lang_matches_feed_lang_when_present", row, services.AppMessageService)
	if rules != nil && rules.DefaultLang.Severity != "" {
		ctx.WithSeverity(rules.DefaultLang.Severity)
	}

	// 1. Validate default_lang is present
	if feedInfo.DefaultLang == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate default_lang is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate default_lang is a valid default_lang
	if feedInfo.DefaultLang != nil && *feedInfo.DefaultLang != "" {
		if !lib.ValidateLanguage(*feedInfo.DefaultLang) {
			ctx.AddError(ctx.GetTranslatedMessage("invalid", *feedInfo.DefaultLang))
			return
		}
	}
}
