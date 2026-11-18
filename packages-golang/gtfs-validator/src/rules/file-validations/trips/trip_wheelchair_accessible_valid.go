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
- Field: wheelchair_accessible
- Presence: Optional
- Type: Enum

# Description

Indicates wheelchair accessibility. Valid options are:

  - 0 or empty - No accessibility information for the trip.
  - 1 - Vehicle being used on this particular trip can accommodate at least one rider in a wheelchair.
  - 2 - No riders in wheelchairs can be accommodated on this trip.

Validation: Checks supplied integer values against the enum and configured options.
The all_options option bypasses only the configured list, not enum validation.
At forbidden severity, rejects supplied values. Blank values are handled by the exists rule.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripWheelchairAccessibleValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Prepare the diagnostic for the configured severity
	description := "The wheelchair_accessible field must be 0, 1, or 2 and match the configured options."
	if config.Severity == types.SEVERITY_FORBIDDEN {
		description = "The wheelchair_accessible field must be empty."
	}

	// 2. Validate supplied enum values and configured options
	return fields.CheckValues(ctx, db, config, "trips", "wheelchair_accessible", description, func(value string) bool {
		if config.Severity == types.SEVERITY_FORBIDDEN {
			return false
		}

		enumValue, err := strconv.Atoi(strings.TrimSpace(value))
		if err != nil || enumValue < 0 || enumValue > 2 {
			return false
		}

		return config.Options == nil || slices.Contains(config.Options, "all_options") ||
			slices.Contains(config.Options, strconv.Itoa(enumValue))
	})
}
