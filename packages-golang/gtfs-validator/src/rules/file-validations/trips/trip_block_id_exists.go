package trips

import (
	"context"
	"database/sql"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: block_id
  - Presence: Optional
  - Type: ID

# Description

Identifies the block to which the trip belongs.
A block consists of a single trip or many sequential trips made using the same vehicle, defined by shared service days and `block_id`. A `block_id` may have trips with different service days, making distinct blocks.

See the example below. To provide in-seat transfers information, [transfers] of `transfer_type` `4` should be provided instead.

# Example: Blocks and service day

The example below is valid, with distinct blocks every day of the week.

	route_id  trip_id  service_id                      block_id  (first stop time)  (last stop time)
	------------------------------------------------------------------------------------------------
	red       trip_1   mon-tues-wed-thurs-fri-sat-sun  red_loop  22:00:00           22:55:00
	red       trip_2   fri-sat-sun                     red_loop  23:00:00           23:55:00
	red       trip_3   fri-sat                         red_loop  24:00:00           24:55:00
	red       trip_4   mon-tues-wed-thurs              red_loop  20:00:00           20:50:00
	red       trip_5   mon-tues-wed-thurs              red_loop  21:00:00           21:50:00

Notes on above table:

  - On Friday into Saturday morning, for example, a single vehicle operates `trip_1`, `trip_2`, and `trip_3` (10:00 PM through 12:55 AM). Note that the last trip occurs on Saturday, 12:00 AM to 12:55 AM, but is part of the Friday "service day" because the times are 24:00:00 to 24:55:00.
  - On Monday, Tuesday, Wednesday, and Thursday, a single vehicle operates `trip_1`, `trip_4`, and `trip_5` in a block from 8:00 PM to 10:55 PM.

Validation: Requires the block_id column and nonblank values when configured at error severity.
At forbidden severity, rejects supplied values.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
[transfers]: https://gtfs.org/documentation/schedule/reference/#transferstxt
*/
func (TripsChecks) TripBlockIDExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, tripsTable, "block_id")
	}

	// 2. Validate the column and required values
	return fields.CheckPresence(ctx, db, config, tripsTable, "block_id", false)
}
