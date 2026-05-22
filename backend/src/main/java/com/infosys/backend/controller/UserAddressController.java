package com.infosys.backend.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.backend.dto.AddressRequest;
import com.infosys.backend.dto.MessageResponse;
import com.infosys.backend.dto.UserAddressResponse;
import com.infosys.backend.service.UserAddressService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/addresses")
@CrossOrigin("*")
public class UserAddressController {

    private final UserAddressService userAddressService;

    public UserAddressController(UserAddressService userAddressService) {
        this.userAddressService = userAddressService;
    }

    @GetMapping
    public List<UserAddressResponse> getAddresses(Principal principal) {
        return userAddressService.getAddressesForUser(principal.getName());
    }

    @PostMapping
    public UserAddressResponse createAddress(@Valid @RequestBody AddressRequest request, Principal principal) {
        return userAddressService.createAddress(principal.getName(), request);
    }

    @PutMapping("/{addressId}")
    public UserAddressResponse updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request,
            Principal principal) {
        return userAddressService.updateAddress(principal.getName(), addressId, request);
    }

    @DeleteMapping("/{addressId}")
    public MessageResponse deleteAddress(@PathVariable Long addressId, Principal principal) {
        userAddressService.deleteAddress(principal.getName(), addressId);
        return new MessageResponse("Address deleted successfully.");
    }
}
