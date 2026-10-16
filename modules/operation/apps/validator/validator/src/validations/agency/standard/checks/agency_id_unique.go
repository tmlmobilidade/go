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
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_id", "agency.txt", "agency_id_unique", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyIdUnique.Severity != "" {
		ctx.WithSeverity(rules.AgencyIdUnique.Severity)
	}

	//
	// 2. Get the agency_id value

	value, count, err := db.Agency.FieldWithCount("agency_id")
	if err != nil {
		return err
	}

	//
	// 3. Check if agency_id is Unique ID

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}

	//
	// 4. Return success

	return nil
}
