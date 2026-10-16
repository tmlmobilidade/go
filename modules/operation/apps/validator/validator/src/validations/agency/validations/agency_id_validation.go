package agency

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
func AgencyIdValidation(db *services.SQLiteRow, rules *types.AgencyRules) error {
	ctx := lib.NewValidationContext("agency_id", "agency.txt", "agency_id_unique", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyId.Severity != "" {
		ctx.WithSeverity(rules.AgencyId.Severity)
	}

	//
	// 1. Get the agency_id value

	value, count, err := db.FieldWithCount("agency_id")
	if err != nil {
		return err
	}

	//
	// 2. Check if agency_id is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 3. Check if agency_id is forbidden

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 4. Check if agency_id is Unique ID

	if count > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("duplicate", value))
	}

	//
	// 5. Validate rules

	if rules != nil && rules.AgencyId.Options != nil {
		if slices.Contains(*rules.AgencyId.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.AgencyId.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 6. Return success

	return nil
}
