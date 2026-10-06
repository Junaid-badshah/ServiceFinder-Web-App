package com.servicefinder.service;

import com.servicefinder.dto.AuthResponse;
import com.servicefinder.dto.LoginRequest;
import com.servicefinder.dto.RegisterRequest;
import com.servicefinder.entity.Provider;
import com.servicefinder.entity.Role;
import com.servicefinder.entity.User;
import com.servicefinder.repository.ProviderRepository;
import com.servicefinder.repository.UserRepository;
import com.servicefinder.security.JwtService;
import com.servicefinder.security.RolePermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private JwtService jwtService;

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getPassword() == null || !user.getPassword().equals(req.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        List<String> permissions = RolePermissions.getPermissions(user.getRole())
                .stream().map(Enum::name).toList();

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                token,
                permissions
        );
    }

    @Transactional
    public AuthResponse resetPassword(String phone, String newPassword) {
        if (phone == null || newPassword == null || newPassword.trim().isEmpty()) {
            throw new RuntimeException("Phone and new password required");
        }
        if (newPassword.length() < 4) {
            throw new RuntimeException("Password must be at least 4 characters");
        }

        if (!otpService.isVerified(phone)) {
            throw new RuntimeException("Phone not verified. Please verify OTP first.");
        }

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(newPassword);
        User saved = userRepository.save(user);

        otpService.clearVerification(phone);

        String token = jwtService.generateToken(saved);
        List<String> permissions = RolePermissions.getPermissions(saved.getRole())
                .stream().map(Enum::name).toList();

        return new AuthResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getPhone(),
                saved.getRole().name(),
                token,
                permissions
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String phone = req.getPhone();

        if (!otpService.isVerified(phone)) {
            throw new RuntimeException("Phone number not verified. Please verify OTP first.");
        }

        Optional<User> existing = userRepository.findByPhone(phone);
        if (existing.isPresent()) {
            User u = existing.get();
            otpService.clearVerification(phone);
            String token = jwtService.generateToken(u);
            List<String> permissions = RolePermissions.getPermissions(u.getRole())
                    .stream().map(Enum::name).toList();
            return new AuthResponse(u.getId(), u.getName(), u.getEmail(), u.getPhone(),
                    u.getRole().name(), token, permissions);
        }

        String email = req.getEmail();
        if (email == null || email.trim().isEmpty()) {
            email = phone.replaceAll("[^0-9]", "") + "@customer.local";
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        String password = req.getPassword();
        if (password == null || password.trim().isEmpty()) {
            password = phone;
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(password);
        user.setRole(Role.CUSTOMER);

        User saved = userRepository.save(user);
        otpService.clearVerification(phone);

        String token = jwtService.generateToken(saved);
        List<String> permissions = RolePermissions.getPermissions(saved.getRole())
                .stream().map(Enum::name).toList();

        return new AuthResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getPhone(),
                saved.getRole().name(),
                token,
                permissions
        );
    }

    @Transactional
    public AuthResponse registerProvider(Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String phone = (String) payload.get("phone");

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        if (!otpService.isVerified(phone)) {
            throw new RuntimeException("Phone number not verified. Please verify OTP first.");
        }

        User user = new User();
        user.setName((String) payload.get("name"));
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword((String) payload.get("password"));
        user.setRole(Role.PROVIDER);
        User savedUser = userRepository.save(user);

        Provider provider = new Provider();
        provider.setName((String) payload.get("name"));
        provider.setService((String) payload.get("service"));
        provider.setLocation((String) payload.get("location"));
        provider.setPhone(phone);
        provider.setEmail(email);
        provider.setDescription((String) payload.get("description"));

        if (payload.get("experience") != null) {
            provider.setExperience(Integer.valueOf(payload.get("experience").toString()));
        }
        if (payload.get("rate") != null) {
            provider.setRate(Double.valueOf(payload.get("rate").toString()));
        }

        provider.setAvailableDays((String) payload.get("availableDays"));
        provider.setAvailableTime((String) payload.get("availableTime"));
        provider.setRating(0.0);
        provider.setUserId(savedUser.getId());
        providerRepository.save(provider);

        otpService.clearVerification(phone);

        String token = jwtService.generateToken(savedUser);
        List<String> permissions = RolePermissions.getPermissions(savedUser.getRole())
                .stream().map(Enum::name).toList();

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole().name(),
                token,
                permissions
        );
    }
}
