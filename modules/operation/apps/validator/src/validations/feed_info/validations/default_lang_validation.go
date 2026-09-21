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
func DefaultLangValidation(severity *types.Severity, feedInfo *types.FeedInfo, row int) {
	ctx := lib.NewValidationContext("default_lang", "feed_info.txt", "default_lang_matches_feed_lang_when_present", row, services.AppMessageService)
	if severity != nil {
		ctx.WithSeverity(*severity)
	}

	if feedInfo.DefaultLang == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("default_lang_validation.required", "default_lang_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("default_lang_validation.forbidden"))
		return
	}

	if feedInfo.DefaultLang != nil && *feedInfo.DefaultLang != "" {
		if valid := lib.ValidateLanguage(*feedInfo.DefaultLang); !valid {
			ctx.AddError(ctx.GetTranslatedMessage("default_lang_validation.invalid"))
			return
		}
	}
}
