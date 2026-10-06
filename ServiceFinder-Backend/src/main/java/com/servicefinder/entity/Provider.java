package com.servicefinder.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "providers", indexes = {
        @Index(name = "idx_service", columnList = "service"),
        @Index(name = "idx_location", columnList = "location"),
        @Index(name = "idx_service_location", columnList = "service, location"),
        @Index(name = "idx_user_id", columnList = "userId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String service;

    @Column(nullable = false)
    private String location;

    private Integer experience;

    @Column(nullable = false)
    private String phone;

    private String email;

    @Column(length = 1000)
    private String description;

    private Double rating;

    private Double rate;

    private String availableDays;

    private String availableTime;

    private Long userId;
}