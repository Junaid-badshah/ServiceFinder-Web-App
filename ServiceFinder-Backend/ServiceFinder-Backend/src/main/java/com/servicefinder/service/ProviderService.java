package com.servicefinder.service;

import com.servicefinder.entity.Provider;
import com.servicefinder.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProviderService {

    @Autowired
    private ProviderRepository providerRepository;

    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }

    public Provider getProviderById(Long id) {
        return providerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider not found with id: " + id));
    }

    public Provider createProvider(Provider provider) {
        return providerRepository.save(provider);
    }

    public Provider updateProvider(Long id, Provider providerDetails) {
        Provider provider = getProviderById(id);
        provider.setName(providerDetails.getName());
        provider.setService(providerDetails.getService());
        provider.setLocation(providerDetails.getLocation());
        provider.setExperience(providerDetails.getExperience());
        provider.setPhone(providerDetails.getPhone());
        provider.setDescription(providerDetails.getDescription());
        provider.setRating(providerDetails.getRating());
        return providerRepository.save(provider);
    }

    public void deleteProvider(Long id) {
        providerRepository.deleteById(id);
    }

    public List<Provider> searchProviders(String service, String location) {
        if (service != null && location != null) {
            return providerRepository.findByServiceAndLocation(service, location);
        } else if (service != null) {
            return providerRepository.findByService(service);
        } else if (location != null) {
            return providerRepository.findByLocation(location);
        }
        return providerRepository.findAll();
    }
}
