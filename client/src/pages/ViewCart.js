import { useState, useEffect } from 'react';
import { Button, Card, Table, Container, ButtonGroup } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ViewCart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            const response = await fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/cart/get-cart', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart.');
            }

            const data = await response.json();
            setCartItems(data.items || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            setLoading(false);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const response = await fetch(`https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/cart/${productId}/remove-from-cart`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to remove item.');
            }

            toast.success('Item removed!');
            fetchCart();
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm('Are you sure you want to clear the cart?')) return;

        try {
            const response = await fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/cart/clear-cart', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to clear cart.');
            }

            toast.success('Cart cleared!');
            fetchCart();
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            // Optionally prevent quantity going below 1
            return;
        }

        try {
            const response = await fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/cart/update-cart-quantity', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId,
                    quantity: newQuantity
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update quantity.');
            }

            toast.success('Quantity updated!');
            fetchCart();
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2);
    };

    if (loading) {
        return <h2 className="text-center mt-5">Loading cart...</h2>;
    }

    return (
        <Container className="my-5">
            <ToastContainer />
            <Card className="p-4 shadow">
                <h1 className="text-center mb-4">Your Shopping Cart</h1>

                {cartItems.length === 0 ? (
                    <h4 className="text-center">Your cart is empty.</h4>
                ) : (
                    <>
                        <Table responsive bordered hover>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Price (₱)</th>
                                    <th>Quantity</th>
                                    <th>Subtotal (₱)</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.product._id}>
                                        <td>{item.product.name}</td>
                                        <td>{item.product.price.toFixed(2)}</td>
                                        <td>
                                            <ButtonGroup size="sm">
                                                <Button 
                                                    variant="secondary" 
                                                    onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                                >
                                                    -
                                                </Button>
                                                <Button variant="light" disabled>{item.quantity}</Button>
                                                <Button 
                                                    variant="secondary" 
                                                    onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                                >
                                                    +
                                                </Button>
                                            </ButtonGroup>
                                        </td>
                                        <td>{(item.product.price * item.quantity).toFixed(2)}</td>
                                        <td>
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                onClick={() => handleRemoveItem(item.product._id)}
                                            >
                                                Remove
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <h4 className="text-end mt-4">Total: ₱{calculateTotal()}</h4>

                        <div className="d-flex justify-content-end mt-3">
                            <Button variant="danger" onClick={handleClearCart}>
                                Clear Cart
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </Container>
    );
}