package trips

import (
	"context"
	"database/sql"
	"slices"
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: direction_id
  - Presence: Optional
  - Type: Enum

# Description

Indicates the direction of travel for a trip.
This field should not be used in routing; it provides a way to separate trips by direction when publishing time tables.

Valid options are:

  - 0 - Travel in one direction (e.g. outbound travel).
  - 1 - Travel in the opposite direction (e.g. inbound travel).

# Example

The `trip_headsign` and `direction_id` fields may be used together to assign a name to travel in each direction for a set of trips. A `trips.txt` file could contain these records for use in time tables:

	trip_id,...,trip_headsign,direction_id
	1234,...,Airport,0
	1505,...,Downtown,1

Validation: Checks supplied integer values against the enum and configured options.
The all_options option bypasses only the configured list, not enum validation.
At forbidden severity, rejects supplied values. Blank values are handled by the exists rule.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripDirectionIDValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Prepare the diagnostic for the configured severity
	description := "The direction_id field must be 0 or 1 and match the configured options."
	if config.Severity == types.SEVERITY_FORBIDDEN {
		description = "The direction_id field must be empty."
	}

	// 2. Validate supplied enum values and configured options
	options := config.Options()
	return fields.CheckValues(ctx, db, config, "trips", "direction_id", description, func(value string) bool {
		if config.Severity == types.SEVERITY_FORBIDDEN {
			return false
		}

		enumValue, err := strconv.Atoi(strings.TrimSpace(value))
		if err != nil || enumValue < 0 || enumValue > 1 {
			return false
		}

		return options == nil || slices.Contains(options, "all_options") ||
			slices.Contains(options, strconv.Itoa(enumValue))
	})
}
