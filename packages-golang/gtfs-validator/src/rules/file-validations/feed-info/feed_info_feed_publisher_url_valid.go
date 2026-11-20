package feedinfo

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [feed_info.txt]
  - Field: feed_publisher_url
  - Presence: Optional
  - Type: URL

# Description

Checks that each supplied feed_publisher_url is a fully qualified HTTP or HTTPS URL.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
*/
func (FeedInfoChecks) FeedInfoFeedPublisherURLValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckValues(ctx, db, config, "feed_info", "feed_publisher_url", "The feed_publisher_url field must be empty.", func(string) bool { return false })
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "feed_info", "feed_publisher_url", "The feed_publisher_url field must be a fully qualified HTTP or HTTPS URL.", validators.ValidateURL)
}
