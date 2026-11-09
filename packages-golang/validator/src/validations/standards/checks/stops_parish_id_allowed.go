package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	"slices"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: parish_id
  - Presence: Configurable
  - Type: ID

# Description

TML extension. Identifier of the parish containing the stop.

This field is not defined by GTFS Standard and has no published presence requirement. Its presence is controlled by
the validation rule configuration.

Validation: Checks populated values against the configured options. A missing option list or the all_options
wildcard accepts any value; an explicitly empty list rejects every populated value. Matching preserves the original
text. Empty values are skipped; required-field checks handle absence.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func ParishIdAllowed(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"parish_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "parish_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the parish_id follows the rule options

		if config.Options != nil {
			if slices.Contains(*config.Options, variables.AllRuleOptions) {
				return nil
			}

			if !slices.Contains(*config.Options, value) {
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed", value))
				return nil
			}
		}

		//
		// 3. Return success

		return nil
	})
}
