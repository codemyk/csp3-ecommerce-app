import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Spinner, InputGroup, FormControl, Card, Toast, ToastContainer } from 'react-bootstrap';

export default function ProductDetails() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetch(`https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/products/${productId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch product details');
            }
            return res.json();
        })
        .then(data => {
            setProduct(data);
            setLoading(false);
        })
        .catch(error => {
            setError(error.message);
            setLoading(false);
        });
    }, [productId]);

    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = async () => {
        try {
            // Add the item to the cart
            const addToCartResponse = await fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/cart/add-to-cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId: product._id,
                    quantity
                })
            });

            if (!addToCartResponse.ok) {
                throw new Error('Failed to add item to cart.');
            }

            // ✅ Now fetch the updated cart
            const cartResponse = await fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/cart/get-cart/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!cartResponse.ok) {
                throw new Error('Failed to fetch updated cart.');
            }

            const cartData = await cartResponse.json();

            // ✅ Calculate total items in cart
            const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);

            // ✅ Set success toast message
            setToastMessage(`Item added! Cart now has ${totalItems} item${totalItems > 1 ? 's' : ''}.`);
            setShowToast(true);

        } catch (error) {
            console.error(error);
            setToastMessage(error.message);
            setShowToast(true);
        }
    };

    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p>Loading product details...</p>
            </div>
        );
    }

    if (error) {
        return <h1>Error: {error}</h1>;
    }

    const subtotal = product.price * quantity;

    return (
        <div className="d-flex justify-content-center my-5">
            <Card style={{ width: '30rem' }} className="shadow p-4">
                <Card.Body>
                    <Card.Title className="bg-dark text-white p-2 rounded text-center">
                        {product.name}
                    </Card.Title>

                    <Card.Text className="mt-3">
                        {product.description}
                    </Card.Text>

                    <h4 className="text-warning">₱{product.price.toFixed(2)}</h4>

                    <div className="d-flex align-items-center my-3">
                        <span className="me-2"><strong>Quantity:</strong></span>
                        <Button variant="secondary" onClick={decreaseQuantity}>-</Button>
                        <FormControl
                            type="text"
                            value={quantity}
                            readOnly
                            className="text-center mx-2"
                            style={{ width: '60px' }}
                        />
                        <Button variant="secondary" onClick={increaseQuantity}>+</Button>
                    </div>

                    {/* Subtotal */}
                    <h5>Subtotal: ₱{subtotal.toFixed(2)}</h5>

                    <Button
                        variant="primary"
                        className="text-white w-100 mt-4"
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </Button>
                </Card.Body>
            </Card>

            {/* Toast Notification */}
            <ToastContainer position="top-center" className="p-3">
                <Toast bg="success" show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
                    <Toast.Body className="text-white d-flex justify-content-between align-items-center">
                        {toastMessage}
                        <Button
                            variant="light"
                            size="sm"
                            className="ms-2"
                            onClick={() => window.location.href = '/cart'}  // Navigate to cart
                        >
                            View Cart
                        </Button>
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}