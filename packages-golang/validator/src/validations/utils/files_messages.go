package validationutils

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strings"
	"sync"
)

// Findings deduplicates generic and conditional presence notices within one run.
type Findings struct {
	mu           sync.Mutex
	missingFiles map[string]bool
}

func (v *Findings) AddError(file, msg string, severity types.Severity) {
	if severity == "" || severity == types.SEVERITY_IGNORE {
		return
	}
	if severity == types.SEVERITY_FORBIDDEN {
		severity = types.SEVERITY_ERROR
	}
	services.AppMessageService.AddMessage(types.Message{
		Field:    "N/A",
		Rows:     []int{},
		FileName: file,
		Message:  msg,
		Severity: severity,
		RuleID:   types.RuleIDGtfsFeedFilePresenceAndIntegrity,
	})
}

// Missing files have a stable rule ID per file, regardless of error, warning, or info severity.
func (v *Findings) AddMissingFile(file, msg string, severity types.Severity) {
	if severity != types.SEVERITY_ERROR && severity != types.SEVERITY_WARNING && severity != types.SEVERITY_INFO {
		return
	}
	v.mu.Lock()
	defer v.mu.Unlock()
	if v.missingFiles == nil {
		v.missingFiles = make(map[string]bool)
	}
	if v.missingFiles[file] {
		return
	}
	v.missingFiles[file] = true
	services.AppMessageService.AddMessage(types.Message{
		Field:    "N/A",
		Rows:     []int{},
		FileName: file,
		Message:  msg,
		Severity: severity,
		RuleID:   strings.TrimSuffix(file, ".txt") + "_file_missing",
	})
}
