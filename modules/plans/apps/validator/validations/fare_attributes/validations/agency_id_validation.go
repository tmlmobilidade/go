package fare_attributes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [calendar_dates.txt]
  - Field: agency_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing agency.agency_id

# Description

Identifies the relevant agency for a fare.

Conditionally Required:
  - Required when the dataset contains data for multiple transit [agencies.txt].
  - Recommended otherwise.

[agencies.txt]: https://gtfs.org/schedule/reference/#agencytxt
[calendar_dates.txt]: https://gtfs.org/schedule/reference/#calendar_datestxt
*/
func AgencyIdValidation(fareAttribute *types.FareAttribute, row int, gtfs *types.Gtfs, rules *types.FareAttributesRules) {
	ctx := lib.NewValidationContext("agency_id", "fare_attributes.txt", "fare_attributes_agency_id_references_agency_table", row, services.AppMessageService)
	if rules != nil && rules.AgencyId.Severity != "" {
		ctx.WithSeverity(rules.AgencyId.Severity)
	} else {
		ctx.WithSeverity(types.SEVERITY_WARNING)
	}

	//  Check if agency_id is required
	agencyCount, _ := gtfs.GetTableCount("agency")
	if fareAttribute.AgencyId == nil && agencyCount > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("agency_id_validation.required"))
		return
	}

	if !ctx.ShouldIgnore() && fareAttribute.AgencyId == nil {
		message := ctx.GetRequiredMessage("agency_id_validation.required", "agency_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// Check Foreign Key
	if !lib.GtfsIdMapKeyExists(gtfs, "agency", *fareAttribute.AgencyId) {
		ctx.AddError(ctx.GetTranslatedMessage("agency_id_validation.not_found"))
		return
	}
}
