import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUserOrders } from "../services/authService";
import { clearStoredToken, getCurrentUser } from "../utils/auth";
import "../styles/dashboard.css";
import "../styles/orders.css";

function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(getCurrentUser());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const checkoutState = location.state;

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
  const formatDateTime = (value) => {
    if (!value) {
      return "Not available";
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getCurrentUserOrders();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleLogout = () => {
    clearStoredToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="orders-page">
      <div className="orders-shell">
        <section className="orders-hero">
          <div>
            <span className="orders-badge">Your orders</span>
            <h1>Ordered products</h1>
          </div>

          <div className="orders-hero-actions">
            <Link className="back-link" to="/products">
              Back to products
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </section>

        <section className="orders-summary-grid">
          <article>
            <span>Customer</span>
            <strong>{user?.name || "Shopper"}</strong>
          </article>
          <article>
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </article>
          <article>
            <span>Products ordered</span>
            <strong>{orders.reduce((sum, order) => sum + (order.items?.length || 0), 0)}</strong>
          </article>
          <article>
            <span>Total spent</span>
            <strong>
              {formatCurrency(orders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0))}
            </strong>
          </article>
        </section>

        <section className="orders-content">
          <div className="orders-card-header">
            <div>
              <span>History</span>
              <h2>Recent orders</h2>
            </div>

            <button type="button" className="secondary-btn header-btn" onClick={loadOrders}>
              {loading ? "Refreshing..." : "Refresh orders"}
            </button>
          </div>

          {checkoutState?.checkoutSuccess ? (
            <p className="form-message success">
              Order #{checkoutState.orderId} placed successfully. Your latest ordered products are shown below.
            </p>
          ) : null}

          {loading ? (
            <p className="empty-state">Loading your orders...</p>
          ) : error ? (
            <p className="form-message error">{error}</p>
          ) : orders.length === 0 ? (
            <div className="orders-empty-state">
              <p className="empty-state">No orders found yet.</p>
              <Link className="primary-btn orders-empty-link" to="/products">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <article key={order.orderId} className="order-card">
                  <div className="order-card-top">
                    <div>
                      <span>Order ID</span>
                      <h3>#{order.orderId}</h3>
                    </div>
                    <div className="order-card-highlight">
                      <span>Total price</span>
                      <strong>{formatCurrency(order.totalPrice)}</strong>
                    </div>
                  </div>

                  <div className="order-meta-grid">
                    <div>
                      <span>Ordered on</span>
                      <strong>{formatDateTime(order.createdAt)}</strong>
                    </div>
                    <div>
                      <span>User ID</span>
                      <strong>{order.userId}</strong>
                    </div>
                    <div>
                      <span>Items</span>
                      <strong>{order.items?.length || 0}</strong>
                    </div>
                  </div>

                  <div className="ordered-product-list">
                    {(order.items || []).map((item) => (
                      <div key={item.orderItemId} className="ordered-product-row">
                        <div className="ordered-product-copy">
                          <span>Product name</span>
                          <strong>{item.productName}</strong>
                          <p>Product ID: {item.productId}</p>
                        </div>

                        <div className="ordered-product-meta">
                          <span>Quantity</span>
                          <strong>{item.quantity}</strong>
                        </div>

                        <div className="ordered-product-meta">
                          <span>Unit price</span>
                          <strong>{formatCurrency(item.unitPrice)}</strong>
                        </div>

                        <div className="ordered-product-meta ordered-product-total">
                          <span>Line total</span>
                          <strong>{formatCurrency(item.lineTotal)}</strong>
                        </div>
                      </div>
                    ))}
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

export default OrdersPage;
