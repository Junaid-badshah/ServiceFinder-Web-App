package com.servicefinder.controller;

import com.servicefinder.entity.Provider;
import com.servicefinder.repository.ProviderRepository;
import com.servicefinder.repository.ServiceRequestRepository;
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
    private ProviderRepository providerRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @GetMapping
    public ResponseEntity<List<Provider>> getAll(
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String location) {
        List<Provider> all = providerRepository.findAll();
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
        return ResponseEntity.ok(providerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider not found")));
    }

    @PostMapping
    public ResponseEntity<Provider> create(@RequestBody Provider provider) {
        return ResponseEntity.ok(providerRepository.save(provider));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Provider> update(@PathVariable Long id, @RequestBody Provider updated) {
        Provider p = providerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        p.setName(updated.getName());
        p.setService(updated.getService());
        p.setLocation(updated.getLocation());
        p.setExperience(updated.getExperience());
        p.setRate(updated.getRate());
        p.setPhone(updated.getPhone());
        p.setDescription(updated.getDescription());
        p.setAvailableDays(updated.getAvailableDays());
        p.setAvailableTime(updated.getAvailableTime());
        return ResponseEntity.ok(providerRepository.save(p));
    }

    // CASCADE DELETE — Provider + uski saari requests
    @DeleteMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAnyRole('PROVIDER', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        List<com.servicefinder.entity.ServiceRequest> reqs =
                serviceRequestRepository.findByProvider_Id(id);
        serviceRequestRepository.deleteAll(reqs);
        providerRepository.deleteById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Provider deleted",
                "requestsDeleted", reqs.size()
        ));
    }
}
