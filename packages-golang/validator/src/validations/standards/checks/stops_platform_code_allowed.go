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
  - Field: platform_code
  - Presence: Optional
  - Type: Text

# Description

Public-facing platform identifier without words such as platform or track.

Validation: Checks populated values against the configured options. A missing option list or the all_options
wildcard accepts any value; an explicitly empty list rejects every populated value. Matching preserves the original
text. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func PlatformCodeAllowed(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"platform_code"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "platform_code")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the platform_code follows the rule options

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
