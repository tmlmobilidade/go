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
  - Field: agency_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a transit brand which is often synonymous with a transit agency.
Note that in some cases, such as when a single agency operates multiple separate services, agencies and brands are distinct.

This document uses the term "agency" in place of "brand". A dataset may contain data from multiple agencies.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyIdValid(db *services.SQLiteContext, ruleContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "agency_id_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_id", "agency.txt", ruleID, db.Row, services.AppMessageService)
	if ruleContext != nil {
		ctx.WithSeverity(ruleContext.Severity)
	}

	//
	// 3. Get the agency_id value

	value, err := db.Agency.Field("agency_id")
	if err != nil {
		return err
	}

	//
	// 4. Validate rules

	if ruleContext != nil && ruleContext.Options != nil {
		if slices.Contains(*ruleContext.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*ruleContext.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 5. Return success

	return nil
}
