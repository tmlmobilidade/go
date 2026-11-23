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
  - Field: bikes_allowed
  - Presence: Optional
  - Type: Enum

# Description

Indicates whether bikes are allowed.

Valid options are:

  - 0 or empty - No bike information for the trip.
  - 1 - Vehicle being used on this particular trip can accommodate at least one bicycle.
  - 2 - No bicycles are allowed on this trip.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func (TripsChecks) TripBikesAllowedValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Prepare the diagnostic for the configured severity
	description := "The bikes_allowed field must be 0, 1, or 2 and match the configured options."
	if config.Severity == types.SEVERITY_FORBIDDEN {
		description = "The bikes_allowed field must be empty."
	}

	// 2. Validate supplied enum values and configured options
	return fields.CheckValues(ctx, db, config, "trips", "bikes_allowed", description, func(value string) bool {
		if config.Severity == types.SEVERITY_FORBIDDEN {
			return false
		}

		bikesAllowed, err := strconv.Atoi(strings.TrimSpace(value))
		if err != nil || bikesAllowed < 0 || bikesAllowed > 2 {
			return false
		}

		return config.Options == nil || slices.Contains(config.Options, "all_options") ||
			slices.Contains(config.Options, strconv.Itoa(bikesAllowed))
	})
}
