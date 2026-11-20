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
  - Presence: Required in GTFS v30
  - Type: File

# Description

Checks that the imported calendar_dates table exists. Forbidden severity requires its absence.
At ignore severity, an absent table blocks dependent rules without a finding.

[calendar_dates.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar-dates
*/
func (CalendarDatesChecks) CalendarDatesFileExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check whether the imported table meets the configured presence requirement
	return fields.CheckFilePresence(ctx, db, config, "calendar_dates")
}
