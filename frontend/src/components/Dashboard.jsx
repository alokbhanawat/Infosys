import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { clearStoredToken, getCurrentUser } from "../utils/auth";
import {
  addProduct,
  getDashboardMessage,
  getProducts,
} from "../services/authService";

function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const [statusMessage, setStatusMessage] = useState("Loading protected data...");
  const [products, setProducts] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
  });

  const getErrorMessage = (error, fallbackMessage) => {
    const apiMessage = error?.response?.data?.message;

    if (apiMessage) {
      return apiMessage;
    }

    if (error?.response?.status === 403) {
      return "Admin access is required for product management.";
    }

    if (error?.response?.status === 401) {
      return "Your session expired. Please log in again.";
    }

    return fallbackMessage;
  };

  const loadProducts = async () => {
    try {
      const productsRes = await getProducts();
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
    } catch (error) {
      setFeedback(getErrorMessage(error, "Unable to load products."));
      setFeedbackType("error");
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const dashboardRes = await getDashboardMessage();
        setStatusMessage(dashboardRes.data || "Protected API working.");
      } catch {
        setStatusMessage("Unable to load protected dashboard data.");
      }

      if (!isAdmin) {
        return;
      }

      await loadProducts();
    };

    loadDashboard();
  }, [isAdmin]);

  const handleLogout = () => {
    clearStoredToken();
    navigate("/login", { replace: true });
  };

  const handleProductChange = (e) => {
    setProductForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setFeedbackType("");

    const price = Number(productForm.price);
    const stock = Number(productForm.stock);

    if (Number.isNaN(price) || Number.isNaN(stock)) {
      setFeedback("Price and stock must be valid numbers.");
      setFeedbackType("error");
      setIsSubmitting(false);
      return;
    }

    try {
      await addProduct({
        ...productForm,
        price,
        stock,
      });

      await loadProducts();
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        imageUrl: "",
      });
      setFeedback("Product added successfully.");
      setFeedbackType("success");
    } catch (error) {
      setFeedback(getErrorMessage(error, "Unable to add product."));
      setFeedbackType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-backdrop"></div>
      <div className="dashboard-layout">
        <section className="dashboard-hero-card">
          <div className="dashboard-topbar">
            <div>
              <span className="dashboard-label">
                {isAdmin ? "Admin workspace" : "User workspace"}
              </span>
              <h1>{user?.name || "User"}</h1>
              <p className="dashboard-subtitle">{statusMessage}</p>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <div className="dashboard-highlight-grid">
            <article className="highlight-card spotlight">
              <span>Signed in as</span>
              <strong>{user?.sub || "Not available"}</strong>
              <p>Your identity is decoded from the JWT returned by the backend login API.</p>
            </article>
            <article className="highlight-card">
              <span>Role</span>
              <strong>{user?.role || "USER"}</strong>
              <p>Product APIs are available only when the backend issues an admin role.</p>
            </article>
            <article className="highlight-card">
              <span>Session</span>
              <strong>{user?.exp ? "Active" : "Unknown"}</strong>
              <p>The frontend validates token expiry before allowing protected routes.</p>
            </article>
          </div>
        </section>

        {isAdmin && (
          <section className="dashboard-grid admin-grid">
            <article className="dashboard-card">
              <div className="section-heading">
                <span>Admin</span>
                <h2>Add product</h2>
              </div>

              <form className="product-form" onSubmit={handleProductSubmit}>
                <div className="input-grid">
                  <input
                    name="name"
                    placeholder="Product name"
                    value={productForm.name}
                    onChange={handleProductChange}
                    required
                  />
                  <input
                    name="category"
                    placeholder="Category"
                    value={productForm.category}
                    onChange={handleProductChange}
                  />
                </div>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={productForm.description}
                  onChange={handleProductChange}
                  rows="4"
                />
                <div className="input-grid">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    placeholder="Price"
                    value={productForm.price}
                    onChange={handleProductChange}
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    name="stock"
                    placeholder="Stock"
                    value={productForm.stock}
                    onChange={handleProductChange}
                    required
                  />
                </div>
                <input
                  name="imageUrl"
                  placeholder="Image URL"
                  value={productForm.imageUrl}
                  onChange={handleProductChange}
                />
                <button type="submit" className="primary-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Add product"}
                </button>
              </form>

              {feedback && <p className={`form-message ${feedbackType}`}>{feedback}</p>}
            </article>

            <article className="dashboard-card">
              <div className="section-heading">
                <span>Catalog</span>
                <h2>Current products</h2>
              </div>

              <button type="button" className="secondary-btn" onClick={loadProducts}>
                Refresh products
              </button>

              <div className="product-list">
                {products.length === 0 ? (
                  <p className="empty-state">No products found yet.</p>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="product-item">
                      <div>
                        <strong>{product.name}</strong>
                        <p>{product.description || "No description provided."}</p>
                      </div>
                      <div className="product-meta">
                        <span>{product.category || "Uncategorized"}</span>
                        <span>Rs. {product.price}</span>
                        <span>Stock: {product.stock}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        )}

        {!isAdmin && (
          <div className="dashboard-card access-note">
            Admin-only product management is hidden because your current JWT role is{" "}
            {user?.role || "USER"}.
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
