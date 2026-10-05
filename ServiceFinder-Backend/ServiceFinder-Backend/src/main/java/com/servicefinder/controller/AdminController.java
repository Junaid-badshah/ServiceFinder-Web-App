package com.servicefinder.controller;

import com.servicefinder.entity.User;
import com.servicefinder.repository.ProviderRepository;
import com.servicefinder.repository.ServiceRequestRepository;
import com.servicefinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/users/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (body.get("role") != null) {
            user.setRole(com.servicefinder.entity.Role.valueOf(body.get("role")));
        }
        if (body.get("name") != null) {
            user.setName(body.get("name"));
        }

        User saved = userRepository.save(user);
        saved.setPassword(null);
        return ResponseEntity.ok(saved);
    }

    // ================================
    // CASCADE DELETE — User + Provider + Requests
    // ================================
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        // 1) User ki saari requests delete karo
        List<com.servicefinder.entity.ServiceRequest> userReqs =
                serviceRequestRepository.findByUser_Id(id);
        serviceRequestRepository.deleteAll(userReqs);

        // 2) User ke provider profiles dhundo
        List<com.servicefinder.entity.Provider> userProviders =
                providerRepository.findByUserId(id);

        // 3) Har provider ki requests delete karo + provider delete karo
        for (com.servicefinder.entity.Provider p : userProviders) {
            List<com.servicefinder.entity.ServiceRequest> provReqs =
                    serviceRequestRepository.findByProvider_Id(p.getId());
            serviceRequestRepository.deleteAll(provReqs);
            providerRepository.delete(p);
        }

        // 4) Finally user delete karo
        userRepository.deleteById(id);

        return ResponseEntity.ok(Map.of(
                "message", "User deleted with all related data",
                "providersDeleted", userProviders.size(),
                "requestsDeleted", userReqs.size()
        ));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('REPORT_VIEW_ALL')")
    public ResponseEntity<?> getStats() {
        List<User> all = userRepository.findAll();
        long totalUsers = all.size();
        long admins = all.stream().filter(u -> u.getRole().name().equals("ADMIN")).count();
        long providers = all.stream().filter(u -> u.getRole().name().equals("PROVIDER")).count();
        long customers = all.stream().filter(u -> u.getRole().name().equals("CUSTOMER")).count();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "admins", admins,
                "providers", providers,
                "customers", customers
        ));
    }
}
