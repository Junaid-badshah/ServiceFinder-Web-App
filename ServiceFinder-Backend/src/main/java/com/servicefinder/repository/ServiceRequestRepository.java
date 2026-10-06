package com.servicefinder.repository;

import com.servicefinder.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByProvider_Id(Long providerId);
    List<ServiceRequest> findByUser_Id(Long userId);
}
