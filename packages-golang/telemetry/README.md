# Telemetry (Go)

Standard-library port of `packages-new/utils/telemetry`. The source layout and names are retained, with initial capitals for exported Go names. Import the facade from `github.com/tmlmobilidade/go/packages-golang/telemetry/src`, or import its logger and timer subpackages directly.

```go
import telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"

timer := telemetry.NewTimer()
telemetry.Logger.Info(telemetry.LogEntry{
    Message: "Ride processed",
    Attributes: map[string]any{"ride_id": "ride-1"},
})
telemetry.Logger.Success(timer.Get())
```

`ENVIRONMENT=dev` selects glyph output; other values select OpenTelemetry JSON lines. Selection happens at package initialization. Error and critical JSON logs go to stderr; other JSON logs go to stdout. Development warnings also go to stderr. Presentation helpers always print to stdout, including in production.

Level methods accept strings, Go errors, and `LogEntry` values or pointers. An empty entry message defaults to the attached error's message; `MessageOverride` can supply an explicitly empty message. Unsupported input types panic. `CreateLogger` accepts a custom renderer.

Go errors do not automatically carry stacks. Errors implementing `StackTrace() string` retain that stack in both renderers; otherwise `exception.stacktrace` is omitted. Exception types use the concrete Go type name. Attributes must be JSON-serializable; serialization and output errors panic.

`NewTimer()` starts a timer. `Get()`, `GetMs()`, and `GetSeconds()` accept an optional reset boolean. `Reset()` restarts it. Timers are intended for one goroutine at a time.

Go requires separate packages for subdirectories. `src/logger/levels/index.go` shares severity definitions between the logger and renderers without an import cycle.

Run `go test ./...` and `go vet ./...` from this directory.
