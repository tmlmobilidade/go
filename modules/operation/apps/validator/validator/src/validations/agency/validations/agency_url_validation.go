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
  - Field: agency_url
  - Presence: Optional
  - Type: URL

# Description

URL of the transit agency.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyUrlValidation(agency *types.Agency, row int, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_url", "agency.txt", "agency_url_valid_url", row, services.AppMessageService)
	if rules != nil && rules.AgencyUrl.Severity != "" {
		ctx.WithSeverity(rules.AgencyUrl.Severity)
	}

	// 1. Check if agency_url is required
	if agency.AgencyUrl == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if agency_url is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Check if agency_url is valid
	if !lib.ValidateUrl(*agency.AgencyUrl) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *agency.AgencyUrl))
		return
	}

	// 4. Validate rules
	if rules != nil && rules.AgencyUrl.Options != nil {
		if slices.Contains(*rules.AgencyUrl.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.AgencyUrl.Options, *agency.AgencyUrl) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *agency.AgencyUrl))
			return
		}
	}
}
