APP_NAME := gtfs-validator
MAIN_PKG := ./

.PHONY: all build run test clean help

all: build

build:
	go build -o ./../bin/$(APP_NAME) $(MAIN_PKG)

run: build
	./../bin/$(APP_NAME) $(ARGS)

dev:
	go run main.go version.go -out=output.json -rules=../tml-rules.json -lang=pt -log=debug --input=$(INPUT)
test:
	go test ./...

clean:
	rm -rf bin

help:
	@echo "Available targets:"
	@echo "  make build        Build the validator binary to bin/$(APP_NAME)"
	@echo "  make run ARGS='...'  Build and run with extra CLI arguments"
	@echo "  make test         Run Go tests"
	@echo "  make clean        Remove build artifacts"