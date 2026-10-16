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
  - Field: agency_email
  - Presence: Optional
  - Type: Email

# Description

Email address actively monitored by the agency's customer service department.
This email address should be a direct contact point where transit riders can reach a customer service representative at the agency.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyEmailValid(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_email", "agency.txt", "agency_email_valid", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyEmailValid.Severity != "" {
		ctx.WithSeverity(rules.AgencyEmailValid.Severity)
	}

	//
	// 2. Get the agency_email value

	value, err := db.Agency.Field("agency_email")
	if err != nil {
		return err
	}

	if value == "" || ctx.ShouldSkip() {
		return nil
	}

	//
	// 3. Check if agency_email is valid

	if !lib.ValidateEmail(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 4. Validate rules

	if rules != nil && rules.AgencyEmailValid.Options != nil {
		if slices.Contains(*rules.AgencyEmailValid.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.AgencyEmailValid.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 5. Return success

	return nil
}
