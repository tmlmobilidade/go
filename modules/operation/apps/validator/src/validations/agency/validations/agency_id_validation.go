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
  - Presence: Conditionally Required
  - Type: Unique ID

# Description

Identifies a transit brand which is often synonymous with a transit agency.
Note that in some cases, such as when a single agency operates multiple separate services, agencies and brands are distinct.

This document uses the term "agency" in place of "brand". A dataset may contain data from multiple agencies.

Conditionally Required:
  - Required when the dataset contains data for multiple transit agencies.
  - Recommended otherwise.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyIdValidation(agency *types.Agency, row int, gtfs types.Gtfs, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_id", "agency.txt", "agency_id_unique", row, services.AppMessageService)
	if rules != nil && rules.AgencyId.Severity != "" {
		ctx.WithSeverity(rules.AgencyId.Severity)
	} else {
		ctx.WithSeverity(types.SEVERITY_WARNING)
	}

	//  Check if agency_id is required
	if agency.AgencyId == nil {
		agencyCount, _ := gtfs.GetTableCount("agency")
		if agencyCount > 1 {
			ctx.AddError(ctx.GetTranslatedMessage("agency_id_validation.required"))
			return
		}

		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("agency_id_validation.required", "agency_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if agency.AgencyId != nil {
		// Check if agency_id is Unique ID
		rows, err := gtfs.GetRowsById("agency", *agency.AgencyId)
		if err == nil && len(rows) > 1 {
			ctx.AddError(ctx.GetTranslatedMessage("agency_id_validation.duplicate"))
		}

		// Validate rules
		if rules != nil && rules.AgencyId.Options != nil {
			if slices.Contains(*rules.AgencyId.Options, types.ALL_OPTIONS) {
				return
			}

			if !slices.Contains(*rules.AgencyId.Options, *agency.AgencyId) {
				ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_id_validation.not_allowed", *agency.AgencyId))
				return
			}
		}
	}
}
