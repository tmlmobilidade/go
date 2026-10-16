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
func AgencyUrlValidation(db *services.SQLiteRow, rules *types.AgencyRules) error {
	ctx := lib.NewValidationContext("agency_url", "agency.txt", "agency_url_valid_url", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyUrl.Severity != "" {
		ctx.WithSeverity(rules.AgencyUrl.Severity)
	}

	//
	// 1. Get the agency_url value

	value, err := db.Field("agency_url")
	if err != nil {
		return err
	}

	//
	// 2. Check if agency_url is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 3. Check if agency_url is forbidden

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 4. Check if agency_url is valid

	if !lib.ValidateUrl(value) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Validate rules

	if rules != nil && rules.AgencyUrl.Options != nil {
		if slices.Contains(*rules.AgencyUrl.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.AgencyUrl.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 6. Return success

	return nil
}
