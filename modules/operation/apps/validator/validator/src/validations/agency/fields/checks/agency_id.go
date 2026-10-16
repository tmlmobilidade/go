package agency_fields

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
func AgencyIdField(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_id", "agency.txt", "agency_id_field", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyIdField.Severity != "" {
		ctx.WithSeverity(rules.AgencyIdField.Severity)
	}

	//
	// 2. Get the agency_id value

	value, err := db.Agency.Field("agency_id")
	if err != nil {
		return err
	}

	//
	// 3. Check if agency_id is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 4. Return success

	return nil
}
