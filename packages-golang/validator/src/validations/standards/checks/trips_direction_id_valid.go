package standard

import (
	"slices"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: direction_id
  - Presence: Optional
  - Type: Enum

# Description

Identifies a travel direction with 0 or 1, helping distinguish opposite directions on the same route. It is not
used to determine routing.

Validation: Checks that the populated value exactly matches one of 0, 1. Whitespace and letter case are preserved.
Configured value lists are not applied. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#tripstxt
*/
func DirectionIdValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "trips", []string{"direction_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "direction_id")
		if err != nil {
			return err
		}

		//
		// 2. Check if the direction_id is required

		if value == "" {
			return nil
		}

		//
		// 3. Parse the direction_id value

		validValues := []string{"0", "1"}
		if !slices.Contains(validValues, value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
