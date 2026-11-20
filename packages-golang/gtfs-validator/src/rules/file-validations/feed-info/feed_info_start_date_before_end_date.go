package feedinfo

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [feed_info.txt]
  - Field: feed_start_date, feed_end_date
  - Presence: Required in GTFS v30
  - Type: Date

# Description

Unimplemented. Compare the feed start and end dates. This placeholder always passes.

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
*/
func (FeedInfoChecks) FeedInfoStartDateBeforeEndDate(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}
