package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: departure_time
  - Presence: Conditionally Required
  - Type: Time

# Description

Departure time from the stop for this trip, using agency.agency_timezone rather than stops.stop_timezone. Use
values beyond 24:00:00 after midnight within the same service day. Arrival and departure are equal when there is no
separate dwell time.

Conditionally Required:
- Required for `timepoint=1`.
- Forbidden when `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.
- Optional otherwise.

Validation: Checks for eight characters and three integer components separated by colons. This format check does
not bound minutes or seconds and therefore accepts values such as 99:99:99. Empty values are skipped;
required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func DepartureTimeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stop_times", []string{"departure_time"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "departure_time")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the departure_time is valid

		if !validators.ValidateTime(value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Return nil

		return nil
	})
}
