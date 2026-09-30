package fare_attributes

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
func AgencyIdValidation(fareAttribute *types.FareAttribute, row int, gtfs *types.Gtfs, rules *types.FareAttributesRules) {
	ctx := lib.NewValidationContext("agency_id", "fare_attributes.txt", "fare_attributes_agency_id_references_agency_table", row, services.AppMessageService)
	if rules != nil && rules.AgencyId.Severity != "" {
		ctx.WithSeverity(rules.AgencyId.Severity)
	}

	// 1. Check if agency_id is required
	agencyCount, _ := gtfs.GetTableCount("agency")
	if fareAttribute.AgencyId == nil {
		if agencyCount > 1 && !ctx.ShouldSkip() {
			message := ctx.GetRequiredMessage("agency_id_validation.required", "agency_id_validation.recommended")
			ctx.AddMessageWithSeverity(message)
		}
		return
	}

	// 2. Check if agency_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_id_validation.forbidden"))
		return
	}

	// 3. Check if agency_id is a valid foreign key
	if !lib.GtfsIdMapKeyExists(gtfs, "agency", *fareAttribute.AgencyId) {
		ctx.AddError(ctx.GetTranslatedMessage("agency_id_validation.not_found", *fareAttribute.AgencyId))
		return
	}
}
