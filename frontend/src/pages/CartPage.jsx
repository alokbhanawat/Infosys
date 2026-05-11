import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  checkoutOrder,
  getCartByUserId,
  getCurrentUserProfile,
  removeFromCart,
  updateCart,
} from "../services/authService";
import {
  clearStoredToken,
  getCurrentUser,
  getStoredToken,
  getStoredUserId,
  setStoredSession,
} from "../utils/auth";
import "../styles/dashboard.css";
import "../styles/cart.css";

const ORDER_SUCCESS_STORAGE_KEY = "latestOrder";

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

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

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

  const handleLogout = () => {
    clearStoredToken();
    navigate("/login", { replace: true });
  };

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

    setIsCheckingOut(true);
    setActionMessage("");
    setActionStatus("success");
    setError("");

    try {
      const response = await checkoutOrder(checkoutUserId);
      const orderDetails = response?.data;

      if (!orderDetails?.orderId) {
        throw new Error("Order ID missing in checkout response.");
      }

      setCartItems([]);
      setActionMessage("Order placed successfully");
      setActionStatus("success");
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
            <Link className="back-link" to="/orders">
              View orders
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
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
                <span>Summary</span>
                <h2>Cart overview</h2>
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
              Review prices, adjust quantities, and keep your cart updated before checkout.
            </p>

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
