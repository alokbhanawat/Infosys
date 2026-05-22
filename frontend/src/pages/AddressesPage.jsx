import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserProfileMenu from "../components/UserProfileMenu";
import {
  createUserAddress,
  deleteUserAddress,
  getCurrentUserProfile,
  getUserAddresses,
  updateUserAddress,
} from "../services/authService";
import { getCurrentUser } from "../utils/auth";
import { validatePhone } from "../utils/authValidation";
import "../styles/address-page.css";

const DEFAULT_ADDRESS_FORM = {
  label: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  defaultAddress: false,
};

function AddressesPage() {
  const [user, setUser] = useState(getCurrentUser());
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(DEFAULT_ADDRESS_FORM);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const loadPage = async () => {
    setLoading(true);
    try {
      const [profileResponse, addressesResponse] = await Promise.all([
        getCurrentUserProfile(),
        getUserAddresses(),
      ]);

      setUser(profileResponse.data || null);
      setAddresses(Array.isArray(addressesResponse.data) ? addressesResponse.data : []);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to load addresses.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const resetForm = () => {
    setFormData(DEFAULT_ADDRESS_FORM);
    setEditingAddressId(null);
  };

  const handleChange = ({ target }) => {
    const { name, value, type, checked } = target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (message) {
      setMessage("");
      setMessageType("success");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setMessage(phoneError);
      setMessageType("error");
      setSaving(false);
      return;
    }

    try {
      if (editingAddressId) {
        await updateUserAddress(editingAddressId, formData);
        setMessage("Address updated successfully.");
      } else {
        await createUserAddress(formData);
        setMessage("Address added successfully.");
      }

      setMessageType("success");
      resetForm();
      await loadPage();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to save address.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddressId(address.id);
    setFormData({
      label: address.label || "",
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      defaultAddress: Boolean(address.defaultAddress),
    });
  };

  const handleDelete = async (addressId) => {
    const confirmed = window.confirm("Delete this address?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteUserAddress(addressId);
      if (editingAddressId === addressId) {
        resetForm();
      }
      setMessage("Address deleted successfully.");
      setMessageType("success");
      await loadPage();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to delete address.");
      setMessageType("error");
    }
  };

  return (
    <div className="address-page">
      <div className="address-shell">
        <section className="address-hero">
          <div>
            <span className="address-badge">Address book</span>
            <h1>Manage delivery addresses</h1>
            <p>Save multiple addresses and reuse them during checkout without typing them again.</p>
          </div>

          <div className="address-hero-actions">
            <Link className="back-link" to="/cart">
              Back to cart
            </Link>
            <UserProfileMenu user={user} />
          </div>
        </section>

        {loading ? (
          <section className="address-card">
            <p className="empty-state">Loading your addresses...</p>
          </section>
        ) : (
          <section className="address-grid">
            <article className="address-card">
              <div className="address-card-header">
                <div>
                  <span>{editingAddressId ? "Edit" : "New"}</span>
                  <h2>{editingAddressId ? "Update address" : "Add address"}</h2>
                </div>
              </div>

              <form className="address-form-grid" onSubmit={handleSubmit}>
                <label className="address-field">
                  <span>Label</span>
                  <input type="text" name="label" value={formData.label} onChange={handleChange} placeholder="Home, Office" required />
                </label>
                <label className="address-field">
                  <span>Full name</span>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Receiver name" required />
                </label>
                <label className="address-field">
                  <span>Phone</span>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit phone number" required />
                </label>
                <label className="address-field">
                  <span>Postal code</span>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="PIN / ZIP code" required />
                </label>
                <label className="address-field address-field-full">
                  <span>Address line 1</span>
                  <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="House number, street, locality" required />
                </label>
                <label className="address-field address-field-full">
                  <span>Address line 2</span>
                  <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} placeholder="Apartment, landmark, optional" />
                </label>
                <label className="address-field">
                  <span>City</span>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" required />
                </label>
                <label className="address-field">
                  <span>State</span>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" required />
                </label>
                <label className="address-field address-field-full">
                  <span>Country</span>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" required />
                </label>
                <label className="address-checkbox">
                  <input type="checkbox" name="defaultAddress" checked={formData.defaultAddress} onChange={handleChange} />
                  <span>Set as default address</span>
                </label>

                {message ? <p className={`form-message ${messageType}`}>{message}</p> : null}

                <div className="address-actions">
                  <button type="submit" className="primary-btn profile-submit-btn" disabled={saving}>
                    {saving ? "Saving..." : editingAddressId ? "Update address" : "Save address"}
                  </button>
                  {editingAddressId ? (
                    <button type="button" className="secondary-btn header-btn" onClick={resetForm}>
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </form>
            </article>

            <article className="address-card">
              <div className="address-card-header">
                <div>
                  <span>Saved addresses</span>
                  <h2>Choose during checkout</h2>
                </div>
              </div>

              {addresses.length === 0 ? (
                <p className="empty-state">No saved addresses yet.</p>
              ) : (
                <div className="address-list">
                  {addresses.map((address) => (
                    <article key={address.id} className="address-item">
                      <div className="address-item-copy">
                        <div className="address-item-topline">
                          <strong>{address.label}</strong>
                          {address.defaultAddress ? <span className="address-default-pill">Default</span> : null}
                        </div>
                        <p>{address.fullName} · {address.phone}</p>
                        <p>
                          {address.addressLine1}
                          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                          {`, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`}
                        </p>
                      </div>
                      <div className="address-item-actions">
                        <button type="button" className="secondary-btn header-btn" onClick={() => handleEdit(address)}>
                          Edit
                        </button>
                        <button type="button" className="cart-remove-btn" onClick={() => handleDelete(address.id)}>
                          &times;
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>
          </section>
        )}
      </div>
    </div>
  );
}

export default AddressesPage;
