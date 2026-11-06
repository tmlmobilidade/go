package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestFeedInfoFeedContactUrl(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "feed_info_feed_contact_url_field",
		table: "feed_info",
		field: "feed_contact_url",
		run:   standard.FeedContactUrlField,
	})
}
