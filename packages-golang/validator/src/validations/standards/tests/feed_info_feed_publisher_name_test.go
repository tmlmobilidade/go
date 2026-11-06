package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestFeedInfoFeedPublisherName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "feed_info_feed_publisher_name_field",
		table: "feed_info",
		field: "feed_publisher_name",
		run:   standard.FeedPublisherNameField,
	})
}
