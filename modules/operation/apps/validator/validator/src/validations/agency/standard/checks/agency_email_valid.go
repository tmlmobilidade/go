package agency_standard

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
func AgencyEmailValid(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "agency_email_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_email", "agency.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the agency_email value

	value, err := db.Agency.Field("agency_email")
	if err != nil {
		return err
	}

	//
	// 4. Check if agency_email is valid

	if !lib.ValidateEmail(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
