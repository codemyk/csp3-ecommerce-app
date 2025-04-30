import { useState, useEffect } from "react";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Global product cache
  const productCache = {};

  async function fetchProductById(productId) {
    try {
      if (productCache[productId]) {
        console.log(`Cache hit for product ${productId}`);
        return productCache[productId];
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/products/${productId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      console.log(`Full product API response for ${productId}:`, data);

      // Correct here based on actual API response
      const product = data; // if the product itself is returned directly

      if (!product) {
        console.error(`Product not found for ID ${productId}`);
        return null;
      }

      productCache[productId] = product;
      return product;
    } catch (err) {
      console.error(`Failed to fetch product ${productId}:`, err);
      return null;
    }
  }

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/orders/my-orders/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const responseData = await response.json();
        console.log("Fetched orders:", JSON.stringify(responseData, null, 2));

        if (!response.ok) {
          throw new Error(responseData.error || "Failed to fetch orders");
        }

        const fetchedOrders = Array.isArray(responseData.Orders)
          ? responseData.Orders
          : [];

        // ✅ Sort orders by date (newest first)
        fetchedOrders.sort(
          (a, b) => new Date(b.orderedOn) - new Date(a.orderedOn)
        );

        const updatedOrders = await Promise.all(
          fetchedOrders.map(async (order) => {
            const updatedProductsOrdered = await Promise.all(
              order.productsOrdered.map(async (item) => {
                if (typeof item.productId === "string") {
                  const productDetails = await fetchProductById(item.productId);
                  return {
                    ...item,
                    productDetails,
                  };
                }
                return item;
              })
            );

            return {
              ...order,
              productsOrdered: updatedProductsOrdered,
            };
          })
        );

        setOrders(updatedOrders);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const formatPeso = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);

  return (
    <div className="container my-5">
      <h1 className="mb-4">Order History</h1>

      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && orders.length === 0 && (
        <div className="alert alert-info">No orders found.</div>
      )}

      {orders.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>Order ID</th>
                <th>Ordered On</th>
                <th>Products</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{new Date(order.orderedOn).toLocaleString()}</td>
                  <td>
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.productsOrdered.map((item, index) => (
                          <tr key={index}>
                            <td>{item.productDetails?.name ?? "[No product name]"}</td>
                            <td>{item.quantity}</td>
                            <td>{formatPeso(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                  <td>{formatPeso(order.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}