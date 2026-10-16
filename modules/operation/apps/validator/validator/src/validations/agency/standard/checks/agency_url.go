package agency_standard

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
func AgencyUrlValid(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_url", "agency.txt", "agency_url_valid", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyUrlValid.Severity != "" {
		ctx.WithSeverity(rules.AgencyUrlValid.Severity)
	}

	//
	// 2. Get the agency_url value

	value, err := db.Agency.Field("agency_url")
	if err != nil {
		return err
	}

	if value == "" || ctx.ShouldSkip() {
		return nil
	}

	//
	// 3. Check if agency_url is valid

	if !lib.ValidateUrl(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 4. Validate rules

	if rules != nil && rules.AgencyUrlValid.Options != nil {
		if slices.Contains(*rules.AgencyUrlValid.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.AgencyUrlValid.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 5. Return success

	return nil
}
