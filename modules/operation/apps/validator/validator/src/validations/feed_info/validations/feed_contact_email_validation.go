package feed_info

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [feed_info.txt]
- Field: feed_contact_email
- Presence: Optional
- Type: Email

# Description

Email address for communication regarding the GTFS dataset and data publishing practices. feed_contact_email is a technical contact for GTFS-consuming applications. Provide customer service contact information through [agency.txt]. It's recommended that at least one of feed_contact_email or feed_contact_url are provided.

[feed_info.txt]: https://gtfs.org/schedule/reference/#feed_infotxt
[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func FeedContactEmailValidation(severity *types.Severity, feedInfo *types.FeedInfo, row int) {
	ctx := lib.NewValidationContext("feed_contact_email", "feed_info.txt", "feed_contact_email_valid_address", row, services.AppMessageService)
	if severity != nil {
		ctx.WithSeverity(*severity)
	} else {
		ctx.WithSeverity(types.SEVERITY_WARNING)
	}

	if feedInfo.FeedContactEmail == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("feed_contact_email_validation.required", "feed_contact_email_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("feed_contact_email_validation.forbidden"))
		return
	}

	if feedInfo.FeedContactEmail != nil && *feedInfo.FeedContactEmail != "" {
		if valid := lib.ValidateEmail(*feedInfo.FeedContactEmail); !valid {
			ctx.AddError(ctx.GetTranslatedMessage("feed_contact_email_validation.invalid"))
			return
		}
	}
}
