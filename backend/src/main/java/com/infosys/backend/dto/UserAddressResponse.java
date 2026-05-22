package com.infosys.backend.dto;

import com.infosys.backend.model.UserAddress;

public class UserAddressResponse {

    private final Long id;
    private final String label;
    private final String fullName;
    private final String phone;
    private final String addressLine1;
    private final String addressLine2;
    private final String city;
    private final String state;
    private final String postalCode;
    private final String country;
    private final boolean defaultAddress;

    public UserAddressResponse(UserAddress address) {
        this.id = address.getId();
        this.label = address.getLabel();
        this.fullName = address.getFullName();
        this.phone = address.getPhone();
        this.addressLine1 = address.getAddressLine1();
        this.addressLine2 = address.getAddressLine2();
        this.city = address.getCity();
        this.state = address.getState();
        this.postalCode = address.getPostalCode();
        this.country = address.getCountry();
        this.defaultAddress = address.isDefaultAddress();
    }

    public Long getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public String getCountry() {
        return country;
    }

    public boolean isDefaultAddress() {
        return defaultAddress;
    }
}
