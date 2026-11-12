package standard

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: [continuous_pickup, start_pickup_drop_off_window, end_pickup_drop_off_window]
  - Presence: Conditionally Forbidden, Conditionally Required, Conditionally Required
  - Type: Enum, Time, Time

# Description

  - continuous_pickup: Continuous boarding policy between this stop and the next: 0 allowed, 1 or empty unavailable,
    2 arrangement by phone or 3 arrangement with the driver. A populated value overrides the route policy; an empty
    value inherits it.
  - start_pickup_drop_off_window: Start of the interval during which on-demand boarding or alighting is available at
    the stop, location group or GeoJSON location.
  - end_pickup_drop_off_window: End of the interval during which on-demand boarding or alighting is available at the
    stop, location group or GeoJSON location.

Validation: Checks that continuous_pickup represents an integer from 0 to 3. If either pickup/drop-off window is
populated on this row, only 1 or an empty value is accepted. Configured value lists are not applied. Empty values
are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func StopTimesContinuousPickupValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stop_times", []string{"continuous_pickup", "start_pickup_drop_off_window", "end_pickup_drop_off_window"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Read the value and pickup/drop-off windows

		values, err := queries.Fields(rowCtx.Source, "continuous_pickup", "start_pickup_drop_off_window", "end_pickup_drop_off_window")
		if err != nil {
			return err
		}
		value := values["continuous_pickup"]
		if value == "" {
			return nil
		}

		//
		// 3. Validate the GTFS enum

		continuous, err := strconv.Atoi(value)
		if err != nil || continuous < 0 || continuous > 3 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid"))
			return nil
		}

		//
		// 4. Only 1 or empty is allowed with pickup/drop-off windows

		if continuous != 1 && (values["start_pickup_drop_off_window"] != "" || values["end_pickup_drop_off_window"] != "") {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden_with_window"))
			return nil
		}

		//
		// 5. Return success

		return nil
	})
}
