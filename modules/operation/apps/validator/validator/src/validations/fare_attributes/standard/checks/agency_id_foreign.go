package fare_attributes_standard

import (
	"main/lib"
	"main/services"
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
func AgencyIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "fare_attributes_agency_id_foreign"

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
	// 4. Get the agency table

	table, err := db.Table("agency")
	if err != nil {
		return err
	}

	//
	// 5. Check if the agency_id exists in the agency table

	exists, err := table.Exists("agency_id", value)
	if err != nil {
		return err
	}
	if !exists {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
	}

	//
	// 6. Return success

	return nil
}
