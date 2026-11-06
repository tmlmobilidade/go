package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestFeedVersionField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "feed_info_feed_version_field",
		table: "feed_info",
		field: "feed_version",
		run:   fields.FeedVersionField,
	})
}
