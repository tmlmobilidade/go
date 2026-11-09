package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"slices"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: bikes_allowed
  - Presence: Optional
  - Type: Enum

# Description

Bicycle carriage policy for the trip: 0 or empty for no information, 1 bicycles allowed or 2 bicycles not allowed.

Validation: Checks that the populated value exactly matches one of 0, 1, 2. Whitespace and letter case are
preserved. Configured value lists are not applied. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#tripstxt
*/
func BikesAllowedValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "trips", []string{"bikes_allowed"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "bikes_allowed")
		if err != nil {
			return err
		}

		//
		// 2. Check if the bikes_allowed is required

		if value == "" {
			return nil
		}

		//
		// 3. Parse the bikes_allowed value

		validValues := []string{"0", "1", "2"}
		if !slices.Contains(validValues, value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
