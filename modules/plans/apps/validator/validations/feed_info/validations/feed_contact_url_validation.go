package feed_info

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [feed_info.txt]
- Field: feed_contact_url
- Presence: Optional
- Type: URL

# Description

URL for contact information, a web-form, support desk, or other tools for communication regarding the GTFS dataset and data publishing practices. feed_contact_url is a technical contact for GTFS-consuming applications. Provide customer service contact information through [agency.txt]. It's recommended that at least one of feed_contact_url or feed_contact_email are provided.

[feed_info.txt]: https://gtfs.org/schedule/reference/#feed_infotxt
[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func FeedContactUrlValidation(severity *types.Severity, feedInfo *types.FeedInfo, row int) {
	ctx := lib.NewValidationContext("feed_contact_url", "feed_info.txt", "feed_contact_url_valid_http_url", row, services.AppMessageService)
	if severity != nil {
		ctx.WithSeverity(*severity)
	} else {
		ctx.WithSeverity(types.SEVERITY_WARNING)
	}

	if feedInfo.FeedContactUrl == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("feed_contact_url_validation.required", "feed_contact_url_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("feed_contact_url_validation.forbidden"))
		return
	}

	if feedInfo.FeedContactUrl != nil && *feedInfo.FeedContactUrl != "" {
		if valid := lib.ValidateUrl(*feedInfo.FeedContactUrl); !valid {
			ctx.AddError(ctx.GetTranslatedMessage("feed_contact_url_validation.invalid"))
			return
		}
	}
}
