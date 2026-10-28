package feed_info_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/feed_info/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/feed_info/utils"
	"main/types"
	"testing"
)

func TestFeedContactEmailValid(t *testing.T) {
	const id = "feed_info_feed_contact_email_valid"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{{"Address", "feeds@example.org", 0},
		{"PlusAddress", "feeds+test@example.org", 0},
		{"Trimmed", " feeds@example.org ", 0},
		{"MissingAt", "example.org", 1},
		{"MissingDomain", "feeds@", 1},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{"feed_contact_email": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "feed_contact_email")
			}
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, values, config)
			if err := checks.FeedContactEmailValid(ctx, config.Rule("feed_info_feed_contact_email_valid")); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "feed_contact_email", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "feed_contact_email", checks.FeedContactEmailValid, map[string]any{"feed_contact_email": "invalid-email"})
}
