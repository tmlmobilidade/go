package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFeedInfoFeedVersion(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "feed_info_feed_version_field",
		table: "feed_info",
		field: "feed_version",
		run:   standard.FeedVersionField,
	})
}
