all: install start


clean:
	sudo go clean -cache -modcache -i -r


install:
	go mod download
	go get github.com/fzipp/gocyclo/cmd/gocyclo
	go get -u github.com/gordonklaus/ineffassign
	GO111MODULE=on go get -v -u github.com/go-critic/go-critic/cmd/gocritic
	go get -u github.com/alexkohler/prealloc

format:
	gofmt -s -w *.go
	gofmt -s -w */**.go
	gofmt -s -w */**/**.go


lint: install format
	go vet ./...
	# Style
	golint -set_exit_status ./...
	gocritic check ./...
	# Complexity
	gocyclo -over 5 *.go
	gocyclo -over 5 */**.go
	gocyclo -over 5 */**/**.go
	# performance
	ineffassign ./...
	prealloc ./...


test: install
	go test -race -short ./...


build:
	go build -ldflags="-s -w -X main.Version=`git rev-parse HEAD`" -o bin/server # build small binary


start: build
	./bin/server

deploy: build
	git pull --ff-only
	./bin/server -port ":80"

develop: format build
	./bin/server -port ":3000"
