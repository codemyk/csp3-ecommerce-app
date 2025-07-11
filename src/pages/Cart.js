import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Table, InputGroup, Form } from 'react-bootstrap';
import { Notyf } from 'notyf';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
    const [cart, setCart] = useState({ cartItems: [] });
    const [loading, setLoading] = useState(true);
    const notyf = new Notyf();
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cart/get-cart`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart');
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
        } catch (err) {
            console.error('Error fetching cart:', err);
            setCart({ cartItems: [], totalPrice: 0 }); // Fallback to empty cart
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleQuantityChange = async (productId, action) => {
        try {
            if (!cart || !cart.cartItems) return;

            const updatedCart = { ...cart };
            const item = updatedCart.cartItems.find(i => i.productId._id === productId._id);
            if (!item) return;

            const unitPrice = item.subtotal / item.quantity;

            if (action === 'increment') {
                item.quantity += 1;
            } else if (action === 'decrement' && item.quantity > 1) {
                item.quantity -= 1;
            }

            item.subtotal = item.quantity * unitPrice;
            updatedCart.totalPrice = updatedCart.cartItems.reduce((total, i) => total + i.subtotal, 0);
            setCart(updatedCart);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cart/update-cart-quantity`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: productId._id,
                    newQuantity: item.quantity,
                }),
            });

            if (!response.ok) {
                throw new Error('Error updating quantity');
            }

            fetchCart();

        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    const handleRemoveFromCart = async (productId) => {
        try {
            if (!cart || !cart.cartItems) return;

            const productIdToSend = productId._id || productId;

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cart/${productIdToSend}/remove-from-cart`, {
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

            const updatedCartItems = cart.cartItems.filter(item => item.productId._id !== productIdToSend);
            const updatedTotalPrice = updatedCartItems.reduce((total, item) => total + item.subtotal, 0);

            setCart({
                ...cart,
                cartItems: updatedCartItems,
                totalPrice: updatedTotalPrice,
            });

            notyf.success('Item removed from cart!');
        } catch (err) {
            console.error('Error removing item from cart:', err.message);
            notyf.error('Failed to remove item from cart');
        }
    };

    const handleClearCart = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cart/clear-cart`, {
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

    if (!cart.cartItems || cart.cartItems.length === 0) {
        return (
            <Row className="my-5 text-center">
                <Col>
                    <div className="p-5 bg-light rounded">
                        <h4 className="mb-4">Your cart is empty. Shop Now!</h4>
                        <Button variant="primary" onClick={() => navigate('/products')}>
                            Shop Now
                        </Button>
                    </div>
                </Col>
            </Row>
        );
    }

    return (
        <div className="cart-wrapper">   
        <Row className="my-4">
            <Col md={12}>
                <h2>Your Shopping Cart</h2>
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
        </div>
    );
}