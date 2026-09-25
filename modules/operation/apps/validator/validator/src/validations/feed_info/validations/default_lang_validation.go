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

	if feedInfo.DefaultLang == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("default_lang_validation.required", "default_lang_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if feedInfo.DefaultLang != nil && *feedInfo.DefaultLang != "" {
		if !lib.ValidateLanguage(*feedInfo.DefaultLang) {
			ctx.AddError(ctx.GetTranslatedMessage("default_lang_validation.invalid", *feedInfo.DefaultLang))
			return
		}
	}
}
