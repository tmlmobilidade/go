package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: path_type
  - Presence: Optional
  - Type: Enum

# Description

Checks the legacy TML route-path classification.

Validation: Accepts only the exact strings 1, 2 or 3. Empty values, whitespace and alternative numeric spellings
are reported. The field metadata describes its optional presence in the v29 schema; this custom value check itself
rejects an empty value.

Example: 1 passes; 01 and an empty value are reported.

Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [routes.txt].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func PathTypeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "routes")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "routes", []string{"path_type"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Get the path_type value

		value, err := queries.Field(rowCtx.Source, "path_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the path_type is valid

		if value != "1" && value != "2" && value != "3" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_valid", value))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
