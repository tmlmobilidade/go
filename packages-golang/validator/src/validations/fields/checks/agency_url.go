package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
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
func AgencyUrlField(db *services.SQLiteContext, ruleContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "agency_url_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_url", "agency.txt", ruleID, db.Row, services.AppMessageService)
	if ruleContext != nil {
		ctx.WithSeverity(ruleContext.Severity)
	}

	//
	// 3. Get the agency_url value

	value, err := db.Agency.Field("agency_url")
	if err != nil {
		return err
	}

	//
	// 4. Check if agency_url is required

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
