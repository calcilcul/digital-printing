//go:build ignore
// +build ignore

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func main() {
	loginData := map[string]string{
		"email":    "admin@gmail.com",
		"password": "123456",
	}
	jsonData, _ := json.Marshal(loginData)

	resp, err := http.Post("http://localhost:8080/login", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	
	var result map[string]interface{}
	json.Unmarshal(body, &result)
	
	data := result["data"].(map[string]interface{})
	token := data["token"].(string)

	fmt.Println("Token:", token)

	// Now try to fetch profile
	req, _ := http.NewRequest("GET", "http://localhost:8080/api/profile", nil)
	req.Header.Add("Authorization", "Bearer "+token)
	
	client := &http.Client{}
	profResp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error Profile:", err)
		return
	}
	defer profResp.Body.Close()
	
	profBody, _ := io.ReadAll(profResp.Body)
	fmt.Println("Profile Status:", profResp.StatusCode)
	fmt.Println("Profile Response:", string(profBody))
}
