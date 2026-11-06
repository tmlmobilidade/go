package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_name_id_match
  - Presence: required
  - Type: String

# Description

Full name of the transit agency.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyNameIdMatch(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "agency")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "agency", []string{"agency_name_id_match", "agency_id", "agency_name"}, func(rowCtx *context.ValidationContext) error {
		config := &rowCtx.Config

		//
		// 2. Get the agency_id value

		agencyID, err := queries.Field(rowCtx.Source, "agency_id")
		if err != nil {
			return err
		}

		//
		// 3. Get the agency_name value

		agencyName, err := queries.Field(rowCtx.Source, "agency_name")
		if err != nil {
			return err
		}

		//
		// 4. Validate rules

		if config.Compare != nil {
			//

			//
			// 5.1. Find the matching key and value

			validName := ""
			for _, compare := range *config.Compare {
				if compare.Key == agencyID && compare.Value == agencyName {
					return nil
				}
				if compare.Key == agencyID {
					validName = compare.Value
				}
			}

			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "no_match", agencyID, agencyName, agencyID, validName))
			return nil
		}

		//
		// 5. Return success

		return nil
	})
}
