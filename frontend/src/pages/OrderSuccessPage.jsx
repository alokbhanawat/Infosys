import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import "../styles/order-success.css";

const ORDER_SUCCESS_STORAGE_KEY = "latestOrder";

function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedOrder = sessionStorage.getItem(ORDER_SUCCESS_STORAGE_KEY);
  let parsedStoredOrder = null;

  if (storedOrder) {
    try {
      parsedStoredOrder = JSON.parse(storedOrder);
    } catch {
      sessionStorage.removeItem(ORDER_SUCCESS_STORAGE_KEY);
    }
  }

  const orderDetails =
    location.state ||
    parsedStoredOrder;

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

  useEffect(() => {
    if (!orderDetails?.orderId) {
      navigate("/cart", { replace: true });
    }
  }, [navigate, orderDetails]);

  if (!orderDetails?.orderId) {
    return null;
  }

  const handleContinueShopping = () => {
    sessionStorage.removeItem(ORDER_SUCCESS_STORAGE_KEY);
    navigate("/products", { replace: true });
  };

  return (
    <div className="order-success-page">
      <div className="order-success-shell">
        <section className="order-success-card">
          <span className="order-success-badge">Order confirmed</span>
          <h1>Order placed successfully</h1>
          <p className="order-success-copy">
            Your checkout is complete and your cart has been cleared.
          </p>

          <div className="order-success-summary">
            <article>
              <span>Order ID</span>
              <strong>{orderDetails.orderId}</strong>
            </article>
            <article>
              <span>Total Amount</span>
              <strong>{formatCurrency(orderDetails.totalAmount)}</strong>
            </article>
          </div>

          <div className="order-success-actions">
            <button
              type="button"
              className="primary-btn order-success-btn"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </button>
            <Link className="back-link order-success-link" to="/cart">
              Back to cart
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
