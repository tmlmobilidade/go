package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_name
  - Presence: Required
  - Type: String

# Description

Full name of the transit agency.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyNameField(db *services.SQLiteContext, ruleContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "agency_name_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_name", "agency.txt", ruleID, db.Row, services.AppMessageService)
	if ruleContext != nil {
		ctx.WithSeverity(ruleContext.Severity)
	}

	//
	// 3. Get the agency_name value

	value, err := db.Agency.Field("agency_name")
	if err != nil {
		return err
	}

	//
	// 4. Check if agency_name is required

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
