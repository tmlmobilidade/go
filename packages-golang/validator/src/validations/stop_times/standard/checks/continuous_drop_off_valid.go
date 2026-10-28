package stop_times_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: continuous_drop_off
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Indicates that the rider can alight from the transit vehicle at any point along the vehicle's travel path as described by shapes.txt, from this stop_time to the next stop_time in the trip's stop_sequence.

Valid options are:

  - 0 - Continuous stopping drop off.
  - 1 or empty - No continuous stopping drop off.
  - 2 - Must phone agency to arrange continuous stopping drop off.
  - 3 - Must coordinate with driver to arrange continuous stopping drop off.

If this field is populated, it overrides any continuous drop-off behavior defined in routes.txt. If this field is empty, the stop_time inherits any continuous drop-off behavior defined in routes.txt.

Conditionally Forbidden:

  - Any value other than 1 or empty is Forbidden if start_pickup_drop_off_window or end_pickup_drop_off_window are defined.
  - Optional otherwise.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func ContinuousDropOffValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule and create the validation context

	const ruleID = "stop_times_continuous_drop_off_valid_gtfs_enum"
	ctx := lib.NewValidationContext("continuous_drop_off", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 2. Check if the rule should be ignored

	if ctx.ShouldIgnore() {
		return nil
	}

	//
	// 3. Read the value and pickup/drop-off windows

	values, err := db.StopTimes.Fields("continuous_drop_off", "start_pickup_drop_off_window", "end_pickup_drop_off_window")
	if err != nil {
		return err
	}

	value := values["continuous_drop_off"]
	if value == "" {
		return nil
	}

	//
	// 4. Validate the GTFS enum

	continuous, err := strconv.Atoi(value)
	if err != nil || continuous < 0 || continuous > 3 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
		return nil
	}

	//
	// 5. Only 1 or empty is allowed with pickup/drop-off windows

	if continuous != 1 && (values["start_pickup_drop_off_window"] != "" || values["end_pickup_drop_off_window"] != "") {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden_with_window"))
		return nil
	}

	//
	// 6. Return success

	return nil
}
