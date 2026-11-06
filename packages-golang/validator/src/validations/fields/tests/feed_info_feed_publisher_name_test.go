package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestFeedPublisherNameField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "feed_info_feed_publisher_name_field",
		table: "feed_info",
		field: "feed_publisher_name",
		run:   fields.FeedPublisherNameField,
	})
}
