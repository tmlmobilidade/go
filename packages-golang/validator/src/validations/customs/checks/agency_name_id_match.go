package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: [agency_id, agency_name]
  - Presence: Conditionally Required, Required
  - Type: Unique ID, Text

# Description

Matches each agency identifier and name against the pairs in the rule configuration.

Validation: An exact key/value pair passes. If Compare is omitted, the rule does not restrict the pair. An
explicitly empty Compare list rejects every pair. Whitespace and letter case are preserved, and empty fields are
not handled specially. The last configured name for the identifier is used in a mismatch message.

Configuration: Compare contains the allowed agency_id and agency_name pairs.

Example: With the configured pair A / Agency, A / Agency passes and A / Other Agency is reported.

Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [agency.txt].

[agency.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/agency
*/
func AgencyNameIdMatch(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "agency")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "agency", []string{"agency_name_id_match", "agency_id", "agency_name"}, func(rowCtx *contextTypes.ValidationContext) error {
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
