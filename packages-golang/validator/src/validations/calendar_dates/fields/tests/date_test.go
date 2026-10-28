package calendar_dates_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/calendar_dates/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/calendar_dates/utils"
	"testing"
)

func TestDateField(t *testing.T) { testutils.CheckPresence(t, "date", checks.DateField) }
