package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: agency_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing agency.agency_id

# Description

Identifies the relevant agency for a fare.

Conditionally Required:
  - Required when the dataset contains data for multiple transit [agencies.txt].
  - Recommended otherwise.

[agencies.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func FareAttributesAgencyIdField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "fare_attributes_agency_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_id", "fare_attributes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the agency_id value

	value, err := db.FareAttributes.Field("agency_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the agency_id is required

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}

		ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("required", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
