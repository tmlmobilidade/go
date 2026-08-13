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
  - Presence: Required
  - Type: URL

# Description

URL of the transit agency.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyUrlValidation(agency *types.Agency, row int, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_url", "agency.txt", "agency_url_valid_url", row, services.AppMessageService)

	if agency.AgencyUrl == nil {
		ctx.AddError(ctx.GetTranslatedMessage("agency_url_validation.required"))
		return
	}

	if !lib.ValidateUrl(*agency.AgencyUrl) {
		ctx.AddError(ctx.GetTranslatedMessage("agency_url_validation.invalid"))
		return
	}

	// Validate rules
	if rules != nil && rules.AgencyUrl.Options != nil {
		if slices.Contains(*rules.AgencyUrl.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.AgencyUrl.Options, *agency.AgencyUrl) {
			ctx.AddError(ctx.GetTranslatedMessage("agency_url_validation.not_allowed", *agency.AgencyUrl))
			return
		}
	}
}
