package consts

import (
	"sync/atomic"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

// messageSeverities publishes an immutable configuration snapshot to running checks.
var MessageSeverities atomic.Pointer[map[string]rules.Severities]