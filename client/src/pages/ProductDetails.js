import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Spinner, InputGroup, FormControl, Card, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function ProductDetails() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [subtotal, setSubtotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_BASE_URL}/products/${productId}`, {
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

    const handleQuantityChange = (action) => {
        let newQuantity = quantity;
        if (action === 'increment') {
            newQuantity = quantity + 1;
        } else if (action === 'decrement' && quantity > 1) {
            newQuantity = quantity - 1;
        }
        setQuantity(newQuantity);
        if (product) {
            setSubtotal(newQuantity * product.price);
        }
    };

    const handleAddToCart = async () => {
        try {
            // Add the item to the cart
            const addToCartResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cart/add-to-cart/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId: product._id,
                    quantity,
                    price: product.price
                })
            });

            if (!addToCartResponse.ok) {
                throw new Error('Failed to add item to cart.');
            }

            // ✅ Now fetch the updated cart
            const cartResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cart/get-cart/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!cartResponse.ok) {
                throw new Error('Failed to fetch updated cart.');
            }

            const cartData = await cartResponse.json();

            // Ensure cartData.cartItems is defined and is an array
            if (Array.isArray(cartData.cartItems)) {
                // ✅ Calculate total items in cart
                const totalItems = cartData.cartItems.reduce((sum, item) => sum + item.quantity, 0);

                // ✅ Set success toast message
                setToastMessage(`Item added! Cart now has ${totalItems} item${totalItems > 1 ? 's' : ''}.`);
                setShowToast(true);

                // Wait for 1 second before navigating
                setTimeout(() => {
                    navigate('/products');
                }, 1000); // Delay for 1 second (1000ms)
            } else {
                throw new Error('Invalid cart data received.');
            }

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
                        <Button variant="secondary" onClick={() => handleQuantityChange('decrement')}>-</Button>
                        <FormControl
                            type="text"
                            value={quantity}
                            readOnly
                            className="text-center mx-2"
                            style={{ width: '60px' }}
                        />
                        <Button variant="secondary" onClick={() => handleQuantityChange('increment')}>+</Button>
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