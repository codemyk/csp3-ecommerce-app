import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Table, InputGroup, Form } from 'react-bootstrap';
import { Notyf } from 'notyf';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
    const [cart, setCart] = useState({ cartItems: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const notyf = new Notyf();
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            const response = await fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/cart/get-cart', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart data');
            }

            const data = await response.json();

            if (data && data.cartItems) {
                setCart({
                    cartItems: data.cartItems,
                    totalPrice: data.totalPrice,
                });
            } else {
                setCart({ cartItems: [], totalPrice: 0 });
            }
            setLoading(false);
        } catch (err) {
            setError('Could not fetch cart data.');
            setLoading(false);
            console.error('Error fetching cart:', err);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleQuantityChange = async (productId, action) => {
        try {
            if (!cart || !cart.cartItems) return;

            const updatedCart = { ...cart };
            const item = updatedCart.cartItems.find(i => i.productId._id === productId._id);  // Compare by _id
            if (!item) return;

            const unitPrice = item.subtotal / item.quantity;

            if (action === 'increment') {
                item.quantity += 1;
            } else if (action === 'decrement' && item.quantity > 1) {
                item.quantity -= 1;
            }

            item.subtotal = item.quantity * unitPrice;
            updatedCart.totalPrice = updatedCart.cartItems.reduce((total, i) => total + i.subtotal, 0);
            setCart(updatedCart); // Updating frontend state

            // Send PATCH request to backend with the productId._id
            const response = await fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/cart/update-cart-quantity', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: productId._id,  // Send only _id
                    newQuantity: item.quantity,
                }),
            });

            if (!response.ok) {
                throw new Error('Error updating quantity');
            }

            // Optionally, refetch the cart data to ensure it is in sync
            fetchCart();

        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    const handleRemoveFromCart = async (productId) => {
        try {
            if (!cart || !cart.cartItems) return;  // Safety check

            // Extract the actual product ID (_id) from the productId object
            const productIdToSend = productId._id || productId; // If productId is an object, get the _id

            // Correct URL for removing product from cart
            const response = await fetch(`https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/cart/${productIdToSend}/remove-from-cart`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove item from cart');
            }

            // Update the cart by filtering out the removed item
            const updatedCartItems = cart.cartItems.filter(item => item.productId._id !== productIdToSend);
            const updatedTotalPrice = updatedCartItems.reduce((total, item) => total + item.subtotal, 0);

            setCart({
                ...cart,
                cartItems: updatedCartItems,
                totalPrice: updatedTotalPrice,
            });

            // Log after cart is updated to check the state
            console.log("Updated Cart Items after removal:", updatedCartItems);
            console.log("Updated Total Price:", updatedTotalPrice);

            // Show success notification only
            notyf.success('Item removed from cart!');
        } catch (err) {
            console.error('Error removing item from cart:', err.message);
            notyf.error('Failed to remove item from cart');
        }
    };

    const handleClearCart = async () => {
        try {
            const response = await fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/cart/clear-cart', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to clear cart');
            }

            setCart({
                ...cart,
                cartItems: [],
                totalPrice: 0,
            });

            notyf.success('Cart cleared successfully!');

        } catch (err) {
            console.error('Error clearing the cart:', err.message);
            notyf.error('Failed to clear cart');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Row className="my-4">
            <Col md={12}>
                <h2>Your Shopping Cart</h2>
                {cart.cartItems.length === 0 ? (
                    <div>Your cart is empty.</div>
                ) : (
                    <Table bordered style={{ tableLayout: 'fixed', width: '100%' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#333', color: 'white' }}>
                                <th style={{ width: '30%' }}>Name</th>
                                <th style={{ width: '15%' }}>Price</th>
                                <th style={{ width: '15%' }}>Quantity</th>
                                <th style={{ width: '15%' }}>Subtotal</th>
                                <th style={{ width: '25%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.cartItems.map(item => (
                                <tr key={item._id}>
                                    <td>{item.productId.name ? item.productId.name : 'Product name missing'}</td>
                                    <td>₱{(item.subtotal / item.quantity).toFixed(2)}</td>
                                    <td>
                                        <InputGroup style={{ width: '120px' }}>
                                            <Button
                                                variant="dark"
                                                onClick={() => handleQuantityChange(item.productId, 'decrement')}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </Button>
                                            <Form.Control
                                                type="text"
                                                value={item.quantity}
                                                readOnly
                                                className="text-center"
                                            />
                                            <Button
                                                variant="dark"
                                                onClick={() => handleQuantityChange(item.productId, 'increment')}
                                            >
                                                +
                                            </Button>
                                        </InputGroup>
                                    </td>
                                    <td>₱{item.subtotal.toFixed(2)}</td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleRemoveFromCart(item.productId)}
                                        >
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {/* ➡️ Add a final row for the TOTAL */}
                            <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                                <td colSpan="3" style={{ textAlign: 'right' }}>
                                    Total:
                                </td>
                                <td>
                                    ₱{cart.totalPrice ? cart.totalPrice.toFixed(2) : '0.00'}
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </Table>
                )}

                <div className="d-flex mt-3">
                    <Button variant="danger" onClick={handleClearCart} className="me-2">
                        Clear Cart
                    </Button>
                    <Button variant="success" onClick={() => navigate('/checkout')}>
                        Check Out
                    </Button>
                </div>
            </Col>
        </Row>
    );
}