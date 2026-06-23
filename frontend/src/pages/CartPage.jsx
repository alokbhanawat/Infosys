import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserProfileMenu from "../components/UserProfileMenu";
import {
  createRazorpayOrder,
  getCartByUserId,
  getCurrentUserProfile,
  getUserAddresses,
  removeFromCart,
  updateCart,
  verifyRazorpayPayment,
} from "../services/authService";
import {
  getCurrentUser,
  getStoredToken,
  getStoredUserId,
  setStoredSession,
} from "../utils/auth";
import "../styles/dashboard.css";
import "../styles/cart.css";

const ORDER_SUCCESS_STORAGE_KEY = "latestOrder";
const RAZORPAY_PENDING_ORDER_KEY = "pendingRazorpayOrder";
const DEFAULT_CHECKOUT_FORM = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  paymentMethod: "CARD",
  cardHolderName: "",
  cardNumber: "",
  upiId: "",
};

const loadRazorpayCheckoutScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Unable to load Razorpay checkout.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });

function CartPage() {
  const navigate = useNavigate();
  const tokenUser = getCurrentUser();
  const [user, setUser] = useState(tokenUser);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionStatus, setActionStatus] = useState("success");
  const [activeCartItemId, setActiveCartItemId] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState(DEFAULT_CHECKOUT_FORM);
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
  const mandatoryFieldMessage = "Please fill this mandatory field.";
  const customerEmail = user?.email || user?.sub || "";

  const showOrderSuccess = (orderDetails) => {
    setCartItems([]);
    setActionMessage("Payment verified and order placed successfully.");
    setActionStatus("success");
    setCheckoutForm((currentForm) => ({
      ...DEFAULT_CHECKOUT_FORM,
      fullName: currentForm.fullName,
      phone: currentForm.phone,
      country: currentForm.country || "India",
    }));
    sessionStorage.removeItem(RAZORPAY_PENDING_ORDER_KEY);
    sessionStorage.setItem(ORDER_SUCCESS_STORAGE_KEY, JSON.stringify(orderDetails));
    navigate("/orders/success", {
      replace: true,
      state: orderDetails,
    });
  };

  const validateCheckoutForm = (formValues) => {
    const validationErrors = {};

    const usingSavedAddress = Boolean(selectedAddressId);

    if (!usingSavedAddress && !formValues.fullName.trim()) {
      validationErrors.fullName = mandatoryFieldMessage;
    }

    if (!usingSavedAddress && !formValues.phone.trim()) {
      validationErrors.phone = mandatoryFieldMessage;
    } else if (!usingSavedAddress && !/^\d{10}$/.test(formValues.phone.trim())) {
      validationErrors.phone = "Enter a correct 10-digit phone number.";
    }

    if (!usingSavedAddress && !formValues.addressLine1.trim()) {
      validationErrors.addressLine1 = mandatoryFieldMessage;
    }

    if (!usingSavedAddress && !formValues.city.trim()) {
      validationErrors.city = mandatoryFieldMessage;
    }

    if (!usingSavedAddress && !formValues.state.trim()) {
      validationErrors.state = mandatoryFieldMessage;
    }

    if (!usingSavedAddress && !formValues.postalCode.trim()) {
      validationErrors.postalCode = mandatoryFieldMessage;
    }

    if (!usingSavedAddress && !formValues.country.trim()) {
      validationErrors.country = mandatoryFieldMessage;
    }

    if (!formValues.paymentMethod.trim()) {
      validationErrors.paymentMethod = mandatoryFieldMessage;
    }

    return validationErrors;
  };

  const loadCart = async () => {
    setLoading(true);
    setError("");

    try {
      const storedUserId = getStoredUserId();
      let activeUser = null;

      if (tokenUser) {
        activeUser = {
          ...tokenUser,
          userId: tokenUser.userId ?? storedUserId,
        };
      }

      if (!activeUser?.userId) {
        activeUser = (await getCurrentUserProfile()).data;
      }

      setUser(activeUser);
      setCheckoutForm((currentForm) => ({
        ...currentForm,
        fullName: currentForm.fullName || activeUser?.name || "",
        phone: currentForm.phone || activeUser?.phone || "",
      }));
      setStoredSession({
        token: getStoredToken(),
        userId: activeUser?.userId,
      });

      const addressesResponse = await getUserAddresses();
      const availableAddresses = Array.isArray(addressesResponse.data) ? addressesResponse.data : [];
      setSavedAddresses(availableAddresses);
      const defaultAddress = availableAddresses.find((address) => address.defaultAddress) || availableAddresses[0];
      if (defaultAddress) {
        setSelectedAddressId(String(defaultAddress.id));
        setCheckoutForm((currentForm) => ({
          ...currentForm,
          fullName: defaultAddress.fullName || currentForm.fullName,
          phone: defaultAddress.phone || currentForm.phone,
          addressLine1: defaultAddress.addressLine1 || "",
          addressLine2: defaultAddress.addressLine2 || "",
          city: defaultAddress.city || "",
          state: defaultAddress.state || "",
          postalCode: defaultAddress.postalCode || "",
          country: defaultAddress.country || "India",
        }));
      }

      const cartResponse = await getCartByUserId(activeUser.userId);
      setCartItems(Array.isArray(cartResponse.data) ? cartResponse.data : []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (item, nextQuantity) => {
    if (!user?.userId || !item?.product?.id || nextQuantity < 1) {
      return;
    }

    setActiveCartItemId(item.cartId);
    setActionMessage("");
    setActionStatus("success");

    try {
      const response = await updateCart({
        userId: user.userId,
        productId: item.product.id,
        quantity: nextQuantity,
      });

      setCartItems((currentItems) =>
        currentItems.map((cartItem) =>
          cartItem.cartId === item.cartId ? response.data || { ...cartItem, quantity: nextQuantity } : cartItem,
        ),
      );
    } catch (requestError) {
      setActionStatus("error");
      setActionMessage(
        requestError?.response?.data?.message || "Unable to update the cart quantity.",
      );
    } finally {
      setActiveCartItemId(null);
    }
  };

  const handleRemoveItem = async (item) => {
    if (!user?.userId || !item?.product?.id) {
      return;
    }

    setActiveCartItemId(item.cartId);
    setActionMessage("");
    setActionStatus("success");

    try {
      const response = await removeFromCart({
        userId: user.userId,
        productId: item.product.id,
      });

      setCartItems((currentItems) => currentItems.filter((cartItem) => cartItem.cartId !== item.cartId));
      setActionMessage(response?.data?.message || "Product removed from cart successfully.");
    } catch (requestError) {
      setActionStatus("error");
      setActionMessage(
        requestError?.response?.data?.message || "Unable to remove this product from cart.",
      );
    } finally {
      setActiveCartItemId(null);
    }
  };

  const handleCheckout = async () => {
    const storedToken = getStoredToken();
    const storedUserId = getStoredUserId();
    const checkoutUserId = user?.userId || storedUserId;

    if (!cartItems.length) {
      setActionStatus("error");
      setActionMessage("Your cart is empty. Add products before checkout.");
      return;
    }

    if (!checkoutUserId || !storedToken) {
      setActionStatus("error");
      setActionMessage("Your session is missing. Please log in again.");
      return;
    }

    const validationErrors = validateCheckoutForm(checkoutForm);
    if (Object.keys(validationErrors).length > 0) {
      setCheckoutErrors(validationErrors);
      setActionStatus("error");
      setActionMessage("Please fill this mandatory field.");
      return;
    }

    setIsCheckingOut(true);
    setCheckoutErrors({});
    setActionMessage("");
    setActionStatus("success");
    setError("");

    try {
      await loadRazorpayCheckoutScript();
      const checkoutPayload = {
        userId: checkoutUserId,
        addressId: selectedAddressId ? Number(selectedAddressId) : null,
        ...checkoutForm,
      };
      const response = await createRazorpayOrder(checkoutPayload);
      const razorpayOrder = response?.data;

      if (!razorpayOrder?.razorpayOrderId || !razorpayOrder?.keyId) {
        throw new Error("Razorpay order details missing in checkout response.");
      }

      sessionStorage.setItem(
        RAZORPAY_PENDING_ORDER_KEY,
        JSON.stringify({
          razorpayOrderId: razorpayOrder.razorpayOrderId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || "INR",
          createdAt: new Date().toISOString(),
        }),
      );

      const orderDetails = await new Promise((resolve, reject) => {
        const selectedMethod = checkoutForm.paymentMethod === "UPI" ? "upi" : "card";
        let paymentSettled = false;
        const rejectIfUnsettled = (error) => {
          if (!paymentSettled) {
            paymentSettled = true;
            reject(error);
          }
        };
        const checkout = new window.Razorpay({
          key: razorpayOrder.keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || "INR",
          name: "INFI Store",
          description: `Cart payment of ${formatCurrency(razorpayOrder.totalPrice)}`,
          order_id: razorpayOrder.razorpayOrderId,
          prefill: {
            name: checkoutForm.fullName,
            email: customerEmail,
            contact: checkoutForm.phone,
          },
          method: {
            card: selectedMethod === "card",
            upi: selectedMethod === "upi",
            netbanking: false,
            wallet: false,
            emi: false,
            paylater: false,
          },
          handler: async (paymentResponse) => {
            try {
              paymentSettled = true;
              const verificationResponse = await verifyRazorpayPayment({
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              });
              resolve(verificationResponse?.data);
            } catch (verificationError) {
              reject(verificationError);
            }
          },
          modal: {
            ondismiss: () => {
              rejectIfUnsettled(new Error("Payment was cancelled before completion."));
            },
          },
          theme: {
            color: "#0f766e",
          },
        });

        checkout.on("payment.failed", (paymentError) => {
          rejectIfUnsettled(new Error(paymentError?.error?.description || "Razorpay payment failed."));
        });

        checkout.open();
      });

      if (!orderDetails?.orderId) {
        throw new Error("Order ID missing after payment verification.");
      }

      showOrderSuccess(orderDetails);
    } catch (requestError) {
      const apiMessage = requestError?.response?.data?.message;
      const fallbackMessage =
        cartItems.length === 0
          ? "Your cart is empty. Add products before checkout."
          : "Unable to complete payment right now.";

      setActionStatus("error");
      setActionMessage(apiMessage || requestError.message || fallbackMessage);
      window.alert(apiMessage || requestError.message || fallbackMessage);
      sessionStorage.removeItem(RAZORPAY_PENDING_ORDER_KEY);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCheckoutInputChange = ({ target }) => {
    const { name, value } = target;
    setCheckoutForm((currentForm) => {
      const nextForm = {
        ...currentForm,
        [name]: value,
      };

      if (name === "paymentMethod") {
        if (value === "CARD") {
          nextForm.upiId = "";
        }

        if (value === "UPI") {
          nextForm.cardHolderName = "";
          nextForm.cardNumber = "";
        }
      }

      return nextForm;
    });
    setCheckoutErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[name];

      if (name === "paymentMethod") {
        delete nextErrors.cardHolderName;
        delete nextErrors.cardNumber;
        delete nextErrors.upiId;
      }

      return nextErrors;
    });
  };

  const handleAddressSelection = ({ target }) => {
    const addressId = target.value;
    setSelectedAddressId(addressId);
    const selectedAddress = savedAddresses.find((address) => String(address.id) === addressId);

    if (!selectedAddress) {
      setCheckoutErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors.fullName;
        delete nextErrors.phone;
        delete nextErrors.addressLine1;
        delete nextErrors.city;
        delete nextErrors.state;
        delete nextErrors.postalCode;
        delete nextErrors.country;
        return nextErrors;
      });
      return;
    }

    setCheckoutForm((currentForm) => ({
      ...currentForm,
      fullName: selectedAddress.fullName || "",
      phone: selectedAddress.phone || "",
      addressLine1: selectedAddress.addressLine1 || "",
      addressLine2: selectedAddress.addressLine2 || "",
      city: selectedAddress.city || "",
      state: selectedAddress.state || "",
      postalCode: selectedAddress.postalCode || "",
      country: selectedAddress.country || "India",
    }));
    setCheckoutErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors.fullName;
      delete nextErrors.phone;
      delete nextErrors.addressLine1;
      delete nextErrors.city;
      delete nextErrors.state;
      delete nextErrors.postalCode;
      delete nextErrors.country;
      return nextErrors;
    });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalCartValue = cartItems.reduce(
    (sum, item) => sum + (Number(item.product?.price) || 0) * (Number(item.quantity) || 0),
    0,
  );

  return (
    <div className="cart-page">
      <div className="cart-shell">
        <section className="cart-hero">
          <div>
            <span className="cart-badge">Your cart</span>
            <h1>Saved products</h1>
            <p>Review every product you added from the catalog or detail page.</p>
          </div>

          <div className="cart-hero-actions">
            <Link className="back-link" to="/products">
              Continue shopping
            </Link>
            <UserProfileMenu user={user} />
          </div>
        </section>

        <section className="cart-summary-grid">
          <article>
            <span>Customer</span>
            <strong>{user?.name || "Shopper"}</strong>
          </article>
          <article>
            <span>Products</span>
            <strong>{cartItems.length}</strong>
          </article>
          <article>
            <span>Total quantity</span>
            <strong>{totalItems}</strong>
          </article>
          <article>
            <span>Total cart value</span>
            <strong>{formatCurrency(totalCartValue)}</strong>
          </article>
        </section>

        <section className="cart-content-grid">
          <div className="cart-card">
            <div className="cart-card-header">
              <div>
                <span>Live cart</span>
                <h2>Added products</h2>
              </div>
              <button type="button" className="secondary-btn header-btn" onClick={loadCart}>
                Refresh cart
              </button>
            </div>

            {actionMessage ? <p className={`form-message ${actionStatus}`}>{actionMessage}</p> : null}

            {loading ? (
              <p className="empty-state">Loading cart items...</p>
            ) : error ? (
              <p className="form-message error">{error}</p>
            ) : cartItems.length === 0 ? (
              <p className="empty-state">No products in cart yet.</p>
            ) : (
              <div className="cart-list">
                {cartItems.map((item) => {
                  const unitPrice = Number(item.product?.price) || 0;
                  const quantity = Number(item.quantity) || 0;
                  const itemTotal = unitPrice * quantity;

                  return (
                    <article key={item.cartId} className="cart-item">
                      <div className="cart-item-main">
                        <div className="cart-item-media">
                          {item.product?.imageUrl ? (
                            <img src={item.product.imageUrl} alt={item.product?.name || "Product"} />
                          ) : (
                            <div className="cart-item-placeholder">
                              <span>{(item.product?.name || "P").slice(0, 1).toUpperCase()}</span>
                            </div>
                          )}
                        </div>

                        <div className="cart-item-copy">
                          <span className="cart-item-label">Product</span>
                          <strong>{item.product?.name || `Product #${item.product?.id}`}</strong>
                          <p>Product ID: {item.product?.id}</p>
                        </div>
                      </div>

                      <div className="cart-item-meta">
                        <span>Unit price</span>
                        <strong>{formatCurrency(unitPrice)}</strong>
                      </div>

                      <div className="cart-item-meta">
                        <span>Quantity</span>
                        <div className="cart-quantity-controls">
                          <button
                            type="button"
                            className="quantity-btn"
                            onClick={() => handleUpdateQuantity(item, quantity - 1)}
                            disabled={activeCartItemId === item.cartId || quantity <= 1}
                            aria-label={`Decrease quantity for ${item.product?.name || "cart item"}`}
                          >
                            -
                          </button>
                          <strong className="quantity-value cart-quantity-value">{quantity}</strong>
                          <button
                            type="button"
                            className="quantity-btn"
                            onClick={() => handleUpdateQuantity(item, quantity + 1)}
                            disabled={activeCartItemId === item.cartId}
                            aria-label={`Increase quantity for ${item.product?.name || "cart item"}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-meta cart-item-total">
                        <span>Item total</span>
                        <strong>{formatCurrency(itemTotal)}</strong>
                      </div>

                      <div className="cart-item-actions">
                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => handleRemoveItem(item)}
                          disabled={activeCartItemId === item.cartId}
                          aria-label={`Remove ${item.product?.name || "product"} from cart`}
                        >
                          &times;
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="cart-card cart-overview-card">
            <div className="cart-card-header cart-overview-header">
              <div>
                <span>Checkout</span>
                <h2>Address & payment</h2>
              </div>
            </div>

            <div className="cart-overview-list">
              <div className="cart-overview-row">
                <span>Products added</span>
                <strong>{cartItems.length}</strong>
              </div>
              <div className="cart-overview-row">
                <span>Total quantity</span>
                <strong>{totalItems}</strong>
              </div>
              <div className="cart-overview-row">
                <span>Customer</span>
                <strong>{user?.name || "Shopper"}</strong>
              </div>
              <div className="cart-overview-row cart-overview-total">
                <span>Total cart value</span>
                <strong>{formatCurrency(totalCartValue)}</strong>
              </div>
            </div>

            <p className="cart-overview-note">
              Review your items, enter delivery details, and choose a Razorpay payment mode before placing the order.
            </p>

            {savedAddresses.length ? (
              <div className="saved-address-picker">
                <label className="checkout-field checkout-field-full">
                  <span>Select saved address</span>
                  <select value={selectedAddressId} onChange={handleAddressSelection}>
                    <option value="">Enter new address</option>
                    {savedAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.label} - {address.addressLine1}, {address.city}
                      </option>
                    ))}
                  </select>
                </label>
                <Link className="back-link" to="/addresses">
                  Manage addresses
                </Link>
              </div>
            ) : null}

            <div className="checkout-form-grid">
              <label className="checkout-field">
                <span>Full name</span>
                <input
                  type="text"
                  name="fullName"
                  value={checkoutForm.fullName}
                  onChange={handleCheckoutInputChange}
                  placeholder="Enter full name"
                  className={checkoutErrors.fullName ? "checkout-input-error" : ""}
                />
                {checkoutErrors.fullName ? <small className="checkout-field-error">{checkoutErrors.fullName}</small> : null}
              </label>

              <label className="checkout-field">
                <span>Phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={checkoutForm.phone}
                  onChange={handleCheckoutInputChange}
                  placeholder="Enter phone number"
                  className={checkoutErrors.phone ? "checkout-input-error" : ""}
                />
                {checkoutErrors.phone ? <small className="checkout-field-error">{checkoutErrors.phone}</small> : null}
              </label>

              <label className="checkout-field checkout-field-full">
                <span>Address line 1</span>
                <input
                  type="text"
                  name="addressLine1"
                  value={checkoutForm.addressLine1}
                  onChange={handleCheckoutInputChange}
                  placeholder="House number, street, locality"
                  className={checkoutErrors.addressLine1 ? "checkout-input-error" : ""}
                />
                {checkoutErrors.addressLine1 ? (
                  <small className="checkout-field-error">{checkoutErrors.addressLine1}</small>
                ) : null}
              </label>

              <label className="checkout-field checkout-field-full">
                <span>Address line 2</span>
                <input
                  type="text"
                  name="addressLine2"
                  value={checkoutForm.addressLine2}
                  onChange={handleCheckoutInputChange}
                  placeholder="Apartment, landmark, optional"
                />
              </label>

              <label className="checkout-field">
                <span>City</span>
                <input
                  type="text"
                  name="city"
                  value={checkoutForm.city}
                  onChange={handleCheckoutInputChange}
                  placeholder="City"
                  className={checkoutErrors.city ? "checkout-input-error" : ""}
                />
                {checkoutErrors.city ? <small className="checkout-field-error">{checkoutErrors.city}</small> : null}
              </label>

              <label className="checkout-field">
                <span>State</span>
                <input
                  type="text"
                  name="state"
                  value={checkoutForm.state}
                  onChange={handleCheckoutInputChange}
                  placeholder="State"
                  className={checkoutErrors.state ? "checkout-input-error" : ""}
                />
                {checkoutErrors.state ? <small className="checkout-field-error">{checkoutErrors.state}</small> : null}
              </label>

              <label className="checkout-field">
                <span>Postal code</span>
                <input
                  type="text"
                  name="postalCode"
                  value={checkoutForm.postalCode}
                  onChange={handleCheckoutInputChange}
                  placeholder="PIN / ZIP code"
                  className={checkoutErrors.postalCode ? "checkout-input-error" : ""}
                />
                {checkoutErrors.postalCode ? (
                  <small className="checkout-field-error">{checkoutErrors.postalCode}</small>
                ) : null}
              </label>

              <label className="checkout-field">
                <span>Country</span>
                <input
                  type="text"
                  name="country"
                  value={checkoutForm.country}
                  onChange={handleCheckoutInputChange}
                  placeholder="Country"
                  className={checkoutErrors.country ? "checkout-input-error" : ""}
                />
                {checkoutErrors.country ? <small className="checkout-field-error">{checkoutErrors.country}</small> : null}
              </label>

              <label className="checkout-field checkout-field-full">
                <span>Payment method</span>
                <select
                  name="paymentMethod"
                  value={checkoutForm.paymentMethod}
                  onChange={handleCheckoutInputChange}
                  className={checkoutErrors.paymentMethod ? "checkout-input-error" : ""}
                >
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                </select>
                {checkoutErrors.paymentMethod ? (
                  <small className="checkout-field-error">{checkoutErrors.paymentMethod}</small>
                ) : null}
              </label>

              <p className="checkout-field checkout-field-full razorpay-helper">
                {checkoutForm.paymentMethod === "UPI"
                  ? "UPI details will be entered securely in Razorpay Checkout."
                  : "Card details will be entered securely in Razorpay Checkout."}
              </p>
            </div>

            <button
              type="button"
              className="primary-btn cart-checkout-btn"
              onClick={handleCheckout}
              disabled={loading || isCheckingOut || !cartItems.length}
            >
              {isCheckingOut ? "Opening Razorpay..." : "Pay with Razorpay"}
            </button>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default CartPage;
