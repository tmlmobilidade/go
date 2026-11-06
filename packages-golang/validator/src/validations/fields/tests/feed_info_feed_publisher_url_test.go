package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestFeedPublisherUrlField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "feed_info_feed_publisher_url_field",
		table: "feed_info",
		field: "feed_publisher_url",
		run:   fields.FeedPublisherUrlField,
	})
}
