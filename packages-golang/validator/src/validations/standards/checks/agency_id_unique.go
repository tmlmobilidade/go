package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_id
  - Presence: Conditionally Required
  - Type: Unique ID

# Description

Identifies the transit agency or brand represented by the record. A dataset can include more than one agency.

Conditionally Required:
- Required when the dataset contains data for multiple transit agencies.
- Recommended otherwise.

Validation: Checks that each non-empty agency_id occurs only once in agency.txt. It compares the original text
without trimming whitespace or normalizing letter case. Empty values are skipped; required-field checks handle
absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[agency.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/agency
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#agencytxt
*/
func AgencyAgencyIdUnique(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "agency", []string{"agency_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Get the agency_id value

		value, count, err := queries.FieldWithCount(rowCtx.Source, "agency_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 3. Check if agency_id is Unique ID

		if count > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "duplicate", value))
		}

		//
		// 4. Return success

		return nil
	})
}
