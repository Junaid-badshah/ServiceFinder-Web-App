package com.servicefinder.service;

import com.servicefinder.entity.ServiceRequest;
import com.servicefinder.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequestService {

    @Autowired
    private ServiceRequestRepository requestRepository;

    public List<ServiceRequest> getAll() {
        return requestRepository.findAll();
    }

    public List<ServiceRequest> getByProviderId(Long providerId) {
        return requestRepository.findByProvider_Id(providerId);
    }

    public List<ServiceRequest> getByUserId(Long userId) {
        return requestRepository.findByUser_Id(userId);
    }

    public ServiceRequest save(ServiceRequest req) {
        return requestRepository.save(req);
    }

    public ServiceRequest updateStatus(Long id, String status) {
        ServiceRequest req = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        req.setStatus(status);
        return requestRepository.save(req);
    }

    public void delete(Long id) {
        requestRepository.deleteById(id);
    }
}
