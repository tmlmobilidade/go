package calendar

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: start_date, end_date
  - Presence: Required
  - Type: Date

# Description

Unimplemented. Compare the service start and end dates. This placeholder always passes.

[calendar.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar
*/
func (CalendarChecks) CalendarStartDateBeforeEndDate(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}
