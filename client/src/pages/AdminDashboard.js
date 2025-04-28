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
      const response = await fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/products/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error adding product:', error);
      triggerError('Failed to add product!');
    }
  };

  const handleAddProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/products', {
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
      await fetch(`https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/products/${selectedProduct._id}/update`, {
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
    try {
      const token = localStorage.getItem('token');
      const endpoint = product.isActive ? 'archive' : 'activate';
      await fetch(`https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/products/${product._id}/${endpoint}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      triggerSuccess(product.isActive ? 'Product disabled successfully!' : 'Product activated successfully!');
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://monhod8wi7.execute-api.us-west-2.amazonaws.com/production/orders/all-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data.orders);
      setShowOrdersModal(true);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
          bg={toastType === 'success' ? 'secondary' : 'danger'}  // 'secondary' is gray and 'danger' is red
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

      <table className="table table-striped text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Availability</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map(product => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>₱{product.price}</td>
                <td>{product.isActive ? 'Available' : 'Unavailable'}</td>
                <td className="d-flex justify-content-center">
                  <Button variant="primary" size="sm" className="me-2" onClick={() => { setSelectedProduct(product); setShowEditModal(true); }}>Edit</Button>
                  <Button
                    variant={product.isActive ? "danger" : "success"}
                    size="sm"
                    onClick={() => toggleAvailability(product)}
                  >
                    {product.isActive ? 'Disable' : 'Activate'}
                  </Button>
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
          {orders.length > 0 ? orders.map((order, index) => (
            <div key={index} className="mb-3">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Total Price:</strong> ₱{order.totalPrice}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <hr />
            </div>
          )) : <p>No orders found.</p>}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminDashboard;