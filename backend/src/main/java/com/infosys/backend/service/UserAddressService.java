package com.infosys.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.infosys.backend.dto.AddressRequest;
import com.infosys.backend.dto.UserAddressResponse;
import com.infosys.backend.model.User;
import com.infosys.backend.model.UserAddress;
import com.infosys.backend.repository.UserAddressRepository;
import com.infosys.backend.repository.UserRepository;

@Service
public class UserAddressService {

    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;

    public UserAddressService(UserRepository userRepository, UserAddressRepository userAddressRepository) {
        this.userRepository = userRepository;
        this.userAddressRepository = userAddressRepository;
    }

    @Transactional(readOnly = true)
    public List<UserAddressResponse> getAddressesForUser(String email) {
        return userAddressRepository.findByUser_EmailOrderByDefaultAddressDescIdDesc(email).stream()
                .map(UserAddressResponse::new)
                .toList();
    }

    @Transactional
    public UserAddressResponse createAddress(String email, AddressRequest request) {
        User user = getUser(email);
        UserAddress address = new UserAddress();
        address.setUser(user);
        applyRequest(address, request);

        boolean shouldMakeDefault = request.isDefaultAddress() || userAddressRepository.countByUser_Email(email) == 0;
        if (shouldMakeDefault) {
            clearDefaultAddress(email);
            address.setDefaultAddress(true);
        }

        return new UserAddressResponse(userAddressRepository.save(address));
    }

    @Transactional
    public UserAddressResponse updateAddress(String email, Long addressId, AddressRequest request) {
        UserAddress address = getAddress(email, addressId);
        applyRequest(address, request);

        if (request.isDefaultAddress()) {
            clearDefaultAddress(email);
            address.setDefaultAddress(true);
        }

        return new UserAddressResponse(userAddressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(String email, Long addressId) {
        UserAddress address = getAddress(email, addressId);
        boolean wasDefault = address.isDefaultAddress();
        userAddressRepository.delete(address);

        if (wasDefault) {
            userAddressRepository.findFirstByUser_EmailOrderByIdAsc(email)
                    .ifPresent(nextAddress -> {
                        nextAddress.setDefaultAddress(true);
                        userAddressRepository.save(nextAddress);
                    });
        }
    }

    @Transactional(readOnly = true)
    public UserAddress getAddressForCheckout(String email, Long addressId) {
        return getAddress(email, addressId);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    private UserAddress getAddress(String email, Long addressId) {
        return userAddressRepository.findByIdAndUser_Email(addressId, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found."));
    }

    private void clearDefaultAddress(String email) {
        userAddressRepository.findByUser_EmailOrderByDefaultAddressDescIdDesc(email)
                .stream()
                .filter(UserAddress::isDefaultAddress)
                .forEach(address -> address.setDefaultAddress(false));
    }

    private void applyRequest(UserAddress address, AddressRequest request) {
        address.setLabel(request.getLabel().trim());
        address.setFullName(request.getFullName().trim());
        address.setPhone(request.getPhone().trim());
        address.setAddressLine1(request.getAddressLine1().trim());
        address.setAddressLine2(trimToNull(request.getAddressLine2()));
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        address.setCountry(request.getCountry().trim());
        if (!request.isDefaultAddress() && address.getId() == null) {
            address.setDefaultAddress(false);
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
