import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserProfileMenu from "../components/UserProfileMenu";
import {
  checkoutOrder,
  getCartByUserId,
  getCurrentUserProfile,
  removeFromCart,
  updateCart,
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

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
  const mandatoryFieldMessage = "Please fill this mandatory field.";

  const validateCheckoutForm = (formValues) => {
    const validationErrors = {};

    if (!formValues.fullName.trim()) {
      validationErrors.fullName = mandatoryFieldMessage;
    }

    if (!formValues.phone.trim()) {
      validationErrors.phone = mandatoryFieldMessage;
    }

    if (!formValues.addressLine1.trim()) {
      validationErrors.addressLine1 = mandatoryFieldMessage;
    }

    if (!formValues.city.trim()) {
      validationErrors.city = mandatoryFieldMessage;
    }

    if (!formValues.state.trim()) {
      validationErrors.state = mandatoryFieldMessage;
    }

    if (!formValues.postalCode.trim()) {
      validationErrors.postalCode = mandatoryFieldMessage;
    }

    if (!formValues.country.trim()) {
      validationErrors.country = mandatoryFieldMessage;
    }

    if (!formValues.paymentMethod.trim()) {
      validationErrors.paymentMethod = mandatoryFieldMessage;
    }

    if (formValues.paymentMethod === "CARD") {
      if (!formValues.cardHolderName.trim()) {
        validationErrors.cardHolderName = mandatoryFieldMessage;
      }

      if (!formValues.cardNumber.trim()) {
        validationErrors.cardNumber = mandatoryFieldMessage;
      } else if (formValues.cardNumber.replace(/\D/g, "").length < 4) {
        validationErrors.cardNumber = "Enter at least the last 4 digits of the card number.";
      }
    }

    if (formValues.paymentMethod === "UPI" && !formValues.upiId.trim()) {
      validationErrors.upiId = mandatoryFieldMessage;
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
      const response = await checkoutOrder({
        userId: checkoutUserId,
        ...checkoutForm,
      });
      const orderDetails = response?.data;

      if (!orderDetails?.orderId) {
        throw new Error("Order ID missing in checkout response.");
      }

      setCartItems([]);
      setActionMessage("Order placed successfully");
      setActionStatus("success");
      setCheckoutForm((currentForm) => ({
        ...DEFAULT_CHECKOUT_FORM,
        fullName: currentForm.fullName,
        phone: currentForm.phone,
        country: currentForm.country || "India",
      }));
      sessionStorage.setItem(ORDER_SUCCESS_STORAGE_KEY, JSON.stringify(orderDetails));

      window.setTimeout(() => {
        navigate("/orders/success", {
          replace: true,
          state: orderDetails,
        });
      }, 700);
    } catch (requestError) {
      const apiMessage = requestError?.response?.data?.message;
      const fallbackMessage =
        cartItems.length === 0
          ? "Your cart is empty. Add products before checkout."
          : "Unable to place the order right now.";

      setActionStatus("error");
      setActionMessage(apiMessage || requestError.message || fallbackMessage);
      window.alert(apiMessage || requestError.message || fallbackMessage);
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

  const isCardPayment = checkoutForm.paymentMethod === "CARD";
  const isUpiPayment = checkoutForm.paymentMethod === "UPI";

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
              Review your items, enter delivery details, and choose how you want to pay before placing the order.
            </p>

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

              {isCardPayment ? (
                <>
                  <label className="checkout-field">
                    <span>Card holder</span>
                    <input
                      type="text"
                      name="cardHolderName"
                      value={checkoutForm.cardHolderName}
                      onChange={handleCheckoutInputChange}
                      placeholder="Name on card"
                      className={checkoutErrors.cardHolderName ? "checkout-input-error" : ""}
                    />
                    {checkoutErrors.cardHolderName ? (
                      <small className="checkout-field-error">{checkoutErrors.cardHolderName}</small>
                    ) : null}
                  </label>

                  <label className="checkout-field">
                    <span>Card number</span>
                    <input
                      type="text"
                      name="cardNumber"
                      value={checkoutForm.cardNumber}
                      onChange={handleCheckoutInputChange}
                      placeholder="Only last 4+ digits are validated"
                      className={checkoutErrors.cardNumber ? "checkout-input-error" : ""}
                    />
                    {checkoutErrors.cardNumber ? (
                      <small className="checkout-field-error">{checkoutErrors.cardNumber}</small>
                    ) : null}
                  </label>
                </>
              ) : null}

              {isUpiPayment ? (
                <label className="checkout-field checkout-field-full">
                  <span>UPI ID</span>
                  <input
                    type="text"
                    name="upiId"
                    value={checkoutForm.upiId}
                    onChange={handleCheckoutInputChange}
                    placeholder="name@bank"
                    className={checkoutErrors.upiId ? "checkout-input-error" : ""}
                  />
                  {checkoutErrors.upiId ? <small className="checkout-field-error">{checkoutErrors.upiId}</small> : null}
                </label>
              ) : null}
            </div>

            <button
              type="button"
              className="primary-btn cart-checkout-btn"
              onClick={handleCheckout}
              disabled={loading || isCheckingOut || !cartItems.length}
            >
              {isCheckingOut ? "Placing order..." : "Checkout"}
            </button>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default CartPage;
