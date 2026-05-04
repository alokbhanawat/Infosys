import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCartByUserId, getCurrentUserProfile } from "../services/authService";
import { clearStoredToken, getCurrentUser } from "../utils/auth";
import "../styles/cart.css";

function CartPage() {
  const navigate = useNavigate();
  const tokenUser = getCurrentUser();
  const [user, setUser] = useState(tokenUser);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    setLoading(true);
    setError("");

    try {
      const activeUser =
        tokenUser?.userId
          ? tokenUser
          : (await getCurrentUserProfile()).data;

      setUser(activeUser);

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

  const totalItems = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

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
        </section>

        <section className="cart-card">
          <div className="cart-card-header">
            <div>
              <span>Live cart</span>
              <h2>Added products</h2>
            </div>
            <button type="button" className="secondary-btn header-btn" onClick={loadCart}>
              Refresh cart
            </button>
          </div>

          {loading ? (
            <p className="empty-state">Loading cart items...</p>
          ) : error ? (
            <p className="form-message error">{error}</p>
          ) : cartItems.length === 0 ? (
            <p className="empty-state">No products in cart yet.</p>
          ) : (
            <div className="cart-list">
              {cartItems.map((item) => (
                <article key={item.cartId} className="cart-item">
                  <div className="cart-item-copy">
                    <span className="cart-item-label">Product</span>
                    <strong>{item.product?.name || `Product #${item.product?.id}`}</strong>
                    <p>Product ID: {item.product?.id}</p>
                  </div>

                  <div className="cart-item-meta">
                    <span>Cart ID</span>
                    <strong>{item.cartId}</strong>
                  </div>

                  <div className="cart-item-meta">
                    <span>Quantity</span>
                    <strong>{item.quantity}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CartPage;
