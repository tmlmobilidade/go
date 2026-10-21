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
func AgencyEmailField(db *services.SQLiteContext, ruleContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "agency_email_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_email", "agency.txt", ruleID, db.Row, services.AppMessageService)
	if ruleContext != nil {
		ctx.WithSeverity(ruleContext.Severity)
	}

	//
	// 3. Get the agency_email value

	value, err := db.Agency.Field("agency_email")
	if err != nil {
		return err
	}

	//
	// 4. Check if agency_email is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 6. Return success

	return nil
}
