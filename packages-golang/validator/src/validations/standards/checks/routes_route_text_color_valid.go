package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_text_color
  - Presence: Optional
  - Type: Color

# Description

Six-digit hexadecimal text color without a leading hash, displayed against route_color. Defaults to black when
absent and must provide sufficient contrast.

Validation: Checks for exactly six hexadecimal characters without a leading hash. Letter case is ignored, but
surrounding whitespace is not removed. Contrast is not assessed. Empty values are skipped; required-field checks
handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#routestxt
*/
func RouteTextColorValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "routes", []string{"route_text_color"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "route_text_color")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the route_text_color is valid

		if !validators.IsHexString(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
