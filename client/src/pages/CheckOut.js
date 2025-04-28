import React, { useState, useEffect } from 'react';
import { Button, Table, Row, Col, Alert } from 'react-bootstrap';
import { Notyf } from 'notyf';
import { useNavigate } from 'react-router-dom';
import 'notyf/notyf.min.css';

export default function CheckOut() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderSuccess, setOrderSuccess] = useState(false);
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
                throw new Error('Failed to fetch cart');
            }

            const data = await response.json();
            setCart(data); // <-- Fix: setCart(data) instead of setCart(data.cart)
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        try {
            // 🛠 Corrected URL here! notice: /orders/checkout (with 's')
            const response = await fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/orders/checkout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Checkout failed');
            }

            notyf.success('Order placed successfully!');
            setOrderSuccess(true);

            setTimeout(() => {
                navigate('/home'); // Redirect after placing the order
            }, 2500);

        } catch (err) {
            console.error('Checkout Error:', err.message);
            notyf.error(err.message);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!cart || cart.cartItems.length === 0) {
        return <div>Your cart is empty. Nothing to checkout.</div>;
    }

    return (
        <Row className="my-4">
            <Col md={12}>
                <h2>Checkout Summary</h2>
                {orderSuccess && <Alert variant="success">Order Successfully Placed!</Alert>}
                <Table bordered hover>
                    <thead>
                        <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.cartItems.map(item => (
                            <tr key={item._id}>
                                <td>{item.productId?.name || 'Unnamed Product'}</td>
                                <td>₱{(item.subtotal / item.quantity).toFixed(2)}</td>
                                <td>{item.quantity}</td>
                                <td>₱{item.subtotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <h4>Total: ₱{cart.totalPrice}</h4>
                <Button variant="success" className="mt-3" onClick={handleCheckout}>
                    Place Order
                </Button>
            </Col>
        </Row>
    );
}