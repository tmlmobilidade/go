package calendar_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/calendar/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/calendar/utils"
	"testing"
)

func TestSaturdayValid(t *testing.T) {
	testutils.CheckWeekday(t, "saturday", checks.SaturdayValid)
}
