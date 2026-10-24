package feed_info_fields_test

import (
	checks "main/validations/feed_info/fields/checks"
	testutils "main/validations/feed_info/utils"
	"testing"
)

func TestFeedContactUrlField(t *testing.T) {
	testutils.CheckPresence(t, "feed_contact_url", checks.FeedContactUrlField)
}
