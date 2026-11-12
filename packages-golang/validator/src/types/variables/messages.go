package variables

import (
	"sync/atomic"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
)

// MessageSeverities publishes an immutable configuration snapshot to running checks.
var MessageSeverities atomic.Pointer[map[string]rules.Severities]

// SeverityRank orders findings by severity when building the report.
var SeverityRank = map[rules.Severities]int{
	rules.SEVERITY_IGNORE:  0,
	rules.SEVERITY_INFO:    1,
	rules.SEVERITY_WARNING: 2,
	rules.SEVERITY_ERROR:   3,
}
