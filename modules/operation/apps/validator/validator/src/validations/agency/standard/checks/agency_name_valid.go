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
  - Field: agency_name
  - Presence: Required
  - Type: String

# Description

Full name of the transit agency.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyNameValid(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_name", "agency.txt", "agency_name_valid", db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule("agency_name_valid")
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 2. Get the agency_name value

	value, err := db.Agency.Field("agency_name")
	if err != nil {
		return err
	}

	//
	// 3. Validate rules

	if rules != nil && rules.Rule("agency_name_valid").Options != nil {
		if slices.Contains(*rules.Rule("agency_name_valid").Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.Rule("agency_name_valid").Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 4. Return success

	return nil
}
