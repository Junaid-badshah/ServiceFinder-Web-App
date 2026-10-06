package com.servicefinder.controller;

import com.servicefinder.entity.Provider;
import com.servicefinder.repository.ServiceRequestRepository;
import com.servicefinder.service.ProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/providers")
@CrossOrigin(origins = "http://localhost:5173")
public class ProviderController {

    @Autowired
    private ProviderService providerService;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @GetMapping
    public ResponseEntity<List<Provider>> getAll(
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String location) {

        // Agar filter nahi hai to cached list use karo
        if ((service == null || service.isEmpty()) && (location == null || location.isEmpty())) {
            return ResponseEntity.ok(providerService.getAllProviders());
        }

        // Filter hai to full list cache se lo, phir filter karo
        List<Provider> all = providerService.getAllProviders();
        if (service != null && !service.isEmpty()) {
            all = all.stream().filter(p -> p.getService() != null &&
                    p.getService().toLowerCase().contains(service.toLowerCase())).toList();
        }
        if (location != null && !location.isEmpty()) {
            all = all.stream().filter(p -> p.getLocation() != null &&
                    p.getLocation().toLowerCase().contains(location.toLowerCase())).toList();
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Provider> getById(@PathVariable Long id) {
        return ResponseEntity.ok(providerService.getProviderById(id));
    }

    @PostMapping
    public ResponseEntity<Provider> create(@RequestBody Provider provider) {
        return ResponseEntity.ok(providerService.createProvider(provider));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Provider> update(@PathVariable Long id, @RequestBody Provider updated) {
        return ResponseEntity.ok(providerService.updateProvider(id, updated));
    }

    // CASCADE DELETE — Provider + uski saari requests
    @DeleteMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAnyRole('PROVIDER', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        List<com.servicefinder.entity.ServiceRequest> reqs =
                serviceRequestRepository.findByProvider_Id(id);
        serviceRequestRepository.deleteAll(reqs);
        providerService.deleteProvider(id);
        return ResponseEntity.ok(Map.of(
                "message", "Provider deleted",
                "requestsDeleted", reqs.size()
        ));
    }
}