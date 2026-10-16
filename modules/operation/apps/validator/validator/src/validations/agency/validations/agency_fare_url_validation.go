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
func AgencyFareUrlValidation(db *services.SQLiteRow, rules *types.AgencyRules) error {
	ctx := lib.NewValidationContext("agency_fare_url", "agency.txt", "agency_fare_url_valid_url", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyFare.Severity != "" {
		ctx.WithSeverity(rules.AgencyFare.Severity)
	}

	//
	// 1. Get the agency_fare_url value

	value, err := db.Field("agency_fare_url")
	if err != nil {
		return err
	}

	//
	// 2. Check if agency_fare_url is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 3. Check if agency_fare_url is forbidden

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 4. Check if agency_fare_url is valid

	if !lib.ValidateUrl(value) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Validate rules

	if rules != nil && rules.AgencyFare.Options != nil {
		if slices.Contains(*rules.AgencyFare.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.AgencyFare.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 6. Return success

	return nil
}
