package calendardates

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [calendar_dates.txt]
  - Field: date
  - Presence: Required
  - Type: Date

# Description

Checks that each supplied date is a real calendar date in YYYYMMDD format.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[calendar_dates.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar-dates
*/
func (CalendarDatesChecks) CalendarDatesDateValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "calendar_dates", "date")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "calendar_dates", "date", "The date field must be a real calendar date in YYYYMMDD format.", validators.ValidateDate)
}
