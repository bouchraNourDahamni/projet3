package main

import (
	"fmt"
	"net/http"
	"os/exec"
)

func main() {
	http.HandleFunc("/start", startServer)
	http.HandleFunc("/log", fetchLogs)

	port := ":8090"
	fmt.Println("bootsraping on ", port)
	http.ListenAndServe(port, nil)
}

func startServer(res http.ResponseWriter, req *http.Request) {
	err := exec.Command("./server/bin/server", "&").Start()
	if err != nil {
		http.Error(res, err.Error(), http.StatusBadGateway)
	}
	fmt.Println("all good")
}

func fetchLogs(res http.ResponseWriter, req *http.Request) {
	cmd := exec.Command("cat", "./server/nohup.out")
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		http.Error(res, err.Error(), http.StatusBadGateway)
	}
	log := make([]byte, 0)
	buf := make([]byte, 1024)
	cmd.Start()
	for {
		n, err := stdout.Read(buf)
		log = append(log, buf[:n]...)
		if err != nil {
			break
		}

	}
	res.Write(log)
	fmt.Println("Logs sent")
}
