package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: continuous_pickup
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Indicates that the rider can board the transit vehicle at any point along the vehicle's travel path as described by shapes.txt, from this stop_time to the next stop_time in the trip's stop_sequence.

Valid options are:

  - 0 - Continuous stopping pickup.
  - 1 or empty - No continuous stopping pickup.
  - 2 - Must phone agency to arrange continuous stopping pickup.
  - 3 - Must coordinate with driver to arrange continuous stopping pickup.

If this field is populated, it overrides any continuous pickup behavior defined in routes.txt. If this field is empty, the stop_time inherits any continuous pickup behavior defined in routes.txt.

Conditionally Forbidden:

  - Any value other than 1 or empty is Forbidden if start_pickup_drop_off_window or end_pickup_drop_off_window are defined.
  - Optional otherwise.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func StopTimesContinuousPickupValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule and create the validation context

	const ruleID = "stop_times_continuous_pickup_valid_gtfs_enum"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("continuous_pickup", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Check if the rule should be ignored

	if ctx.ShouldIgnore() {
		return nil
	}

	//
	// 4. Read the value and pickup/drop-off windows

	values, err := db.StopTimes.Fields("continuous_pickup", "start_pickup_drop_off_window", "end_pickup_drop_off_window")
	if err != nil {
		return err
	}
	value := values["continuous_pickup"]
	if value == "" {
		return nil
	}

	//
	// 5. Validate the GTFS enum

	continuous, err := strconv.Atoi(value)
	if err != nil || continuous < 0 || continuous > 3 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
		return nil
	}

	//
	// 6. Only 1 or empty is allowed with pickup/drop-off windows

	if continuous != 1 && (values["start_pickup_drop_off_window"] != "" || values["end_pickup_drop_off_window"] != "") {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden_with_window"))
		return nil
	}

	//
	// 7. Return success

	return nil
}
