package agency_fields

import (
	"main/lib"
	"main/services"
	"main/types"
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
func AgencyEmailField(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_email", "agency.txt", "agency_email_field", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyEmailField.Severity != "" {
		ctx.WithSeverity(rules.AgencyEmailField.Severity)
	}

	//
	// 2. Get the agency_email value

	value, err := db.Agency.Field("agency_email")
	if err != nil {
		return err
	}

	//
	// 3. Check if agency_email is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}
	
	//
	// 5. Return success

	return nil
}
