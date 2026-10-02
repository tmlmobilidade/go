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
  - Field: agency_fare_url
  - Presence: Optional
  - Type: URL

# Description

URL of a web page where a rider can purchase tickets or other fare instruments for that agency, or a web page containing information about that agency's fares.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyFareUrlValidation(agency *types.Agency, row int, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_fare_url", "agency.txt", "agency_fare_url_valid_url", row, services.AppMessageService)
	if rules != nil && rules.AgencyFare.Severity != "" {
		ctx.WithSeverity(rules.AgencyFare.Severity)
	}

	// 1. Check if agency_fare_url is required
	if agency.AgencyFareUrl == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if agency_fare_url is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Check if agency_fare_url is valid
	if agency.AgencyFareUrl != nil && !lib.ValidateUrl(*agency.AgencyFareUrl) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", *agency.AgencyFareUrl))
		return
	}

	// 4. Validate rules
	if rules != nil && rules.AgencyFare.Options != nil {
		if slices.Contains(*rules.AgencyFare.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.AgencyFare.Options, *agency.AgencyFareUrl) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *agency.AgencyFareUrl))
			return
		}
	}
}
