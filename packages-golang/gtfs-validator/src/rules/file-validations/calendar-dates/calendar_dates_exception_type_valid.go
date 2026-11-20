package calendardates

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [calendar_dates.txt]
  - Field: exception_type
  - Presence: Required
  - Type: Enum

# Description

Accepted values include 1, 2.
Configured options may narrow that list. all_options bypasses the configured list.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[calendar_dates.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar-dates
*/
func (CalendarDatesChecks) CalendarDatesExceptionTypeValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check the enum and configured options
	return fields.CheckEnum(ctx, db, config, "calendar_dates", "exception_type", "1", "2")
}
