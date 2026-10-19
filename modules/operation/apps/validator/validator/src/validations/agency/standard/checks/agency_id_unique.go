package agency_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a transit brand which is often synonymous with a transit agency.
Note that in some cases, such as when a single agency operates multiple separate services, agencies and brands are distinct.

This document uses the term "agency" in place of "brand". A dataset may contain data from multiple agencies.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyIdUnique(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "agency_id_unique"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_id", "agency.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the agency_id value

	value, count, err := db.Agency.FieldWithCount("agency_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if agency_id is Unique ID

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}

	//
	// 5. Return success

	return nil
}
