package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: pickup_type
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Boarding policy: 0 or empty for regular service, 1 unavailable, 2 arrangement by phone or 3 arrangement with the
driver.

Conditionally Forbidden:
- `pickup_type=0` forbidden if `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.
- `pickup_type=3` forbidden if `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.
- Optional otherwise.

Validation: Checks that the populated value represents an integer in 0, 1, 2, 3. Matching uses the parsed integer
rather than its original spelling. Configured value lists are not applied. Empty values are skipped; required-field
checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func PickupTypeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stop_times", []string{"pickup_type"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "pickup_type")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the pickup_type is valid

		pt, err := strconv.Atoi(value)
		if err != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		if pt < 0 || pt > 3 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
