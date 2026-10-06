package com.servicefinder.controller;

import com.servicefinder.entity.ServiceRequest;
import com.servicefinder.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:5173")
public class RequestController {

    @Autowired
    private RequestService requestService;

    @GetMapping
    public ResponseEntity<List<ServiceRequest>> getAll() {
        return ResponseEntity.ok(requestService.getAll());
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ServiceRequest>> getByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(requestService.getByProviderId(providerId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ServiceRequest>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(requestService.getByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<ServiceRequest> create(@RequestBody ServiceRequest req) {
        return ResponseEntity.ok(requestService.save(req));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ServiceRequest> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(requestService.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        requestService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
