import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Toast, ToastContainer } from 'react-bootstrap';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });
  const [orders, setOrders] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchProducts();
  }, []);

  const triggerSuccess = (message) => {
    setSuccessMessage(message);
    setToastType('success');
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 1000);
  };

  const triggerError = (message) => {
    setSuccessMessage(message);
    setToastType('error');
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 1000);
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/products/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      triggerError('Failed to fetch products!');
    }
  };

  const handleAddProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newProduct)
      });
      setShowAddModal(false);
      setNewProduct({ name: '', description: '', price: '' });
      fetchProducts();
      triggerSuccess('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleEditProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/products/${selectedProduct._id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(selectedProduct)
      });
      setShowEditModal(false);
      fetchProducts();
      triggerSuccess('Product updated successfully!');
    } catch (error) {
      console.error('Error editing product:', error);
    }
  };

  const toggleAvailability = async (product) => {
    const newStatus = product.status === 'active' ? 'archived' : 'active';
    const updatedProduct = { ...product, status: newStatus };

    // Optimistic update
    setProducts(prev =>
      prev.map(p => (p._id === product._id ? updatedProduct : p))
    );

    try {
      const token = localStorage.getItem('token');
      const endpoint = newStatus === 'active' ? 'activate' : 'archive';
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/products/${product._id}/${endpoint}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update');
      }

      triggerSuccess(newStatus === 'active' ? 'Product activated successfully!' : 'Product disabled successfully!');
    } catch (error) {
      console.error('Toggle failed:', error);

      // Revert the change
      setProducts(prev =>
        prev.map(p => (p._id === product._id ? product : p))
      );

      triggerError('Failed to update product availability');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/orders/all-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      if (data.Orders && Array.isArray(data.Orders)) {
        setOrders(data.Orders);
      } else {
        setOrders([]);
      }

      setShowOrdersModal(true);
    } catch (error) {
      console.error('Error fetching orders:', error);
      triggerError('Failed to fetch orders!');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Admin Dashboard</h1>

      {/* Toast Popup */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          show={showSuccess}
          onClose={() => setShowSuccess(false)}
          bg={toastType === 'success' ? 'secondary' : 'danger'}
          delay={1500}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">{toastType === 'success' ? 'Success' : 'Error'}</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{successMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex justify-content-center mb-4">
        <Button variant="primary" className="me-2" onClick={() => setShowAddModal(true)}>Add New Product</Button>
        <Button variant="secondary" onClick={fetchOrders}>Show User Orders</Button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped text-center align-middle">
          <thead className="table-dark">
            <tr>
              <th style={{ minWidth: '120px' }}>Name</th>
              <th style={{ maxWidth: '250px', wordBreak: 'break-word' }}>Description</th>
              <th style={{ minWidth: '80px' }}>Price</th>
              <th style={{ minWidth: '100px' }}>Availability</th>
              <th style={{ minWidth: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map(product => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.description}
                  </td>
                  <td>₱{parseFloat(product.price).toFixed(2)}</td>
                  <td>{product.status === 'active' ? 'Available' : 'Unavailable'}</td>
                  <td className="text-center">
                    <div className="d-inline-flex justify-content-center align-items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant={product.status === 'active' ? 'danger' : 'success'}
                        size="sm"
                        onClick={() => toggleAvailability(product)}
                      >
                        {product.status === 'active' ? 'Disable' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No products available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add New Product</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Close</Button>
          <Button
            variant="primary"
            onClick={handleAddProduct}
            disabled={!newProduct.name || !newProduct.description || !newProduct.price}
          >
            Add Product
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton><Modal.Title>Edit Product</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={selectedProduct?.name || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control value={selectedProduct?.description || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" value={selectedProduct?.price || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleEditProduct}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Show Orders Modal */}
      <Modal show={showOrdersModal} onHide={() => setShowOrdersModal(false)}>
        <Modal.Header closeButton><Modal.Title>User Orders</Modal.Title></Modal.Header>
        <Modal.Body>
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <div key={index} className="mb-3">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Total Price:</strong> ₱{order.totalPrice}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <hr />
              </div>
            ))
          ) : (
            <p>No orders found.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
