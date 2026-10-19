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
func AgencyIdValid(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_id", "agency.txt", "agency_id_valid", db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule("agency_id_valid")
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 2. Get the agency_id value

	value, err := db.Agency.Field("agency_id")
	if err != nil {
		return err
	}

	//
	// 3. Validate rules

	if rules != nil && rules.Rule("agency_id_valid").Options != nil {
		if slices.Contains(*rules.Rule("agency_id_valid").Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.Rule("agency_id_valid").Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 4. Return success

	return nil
}
