import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
    return (
        <div className="product-card p-4 border rounded shadow d-flex flex-column" style={{ height: '100%' }}>
            {/* Product Name in primary color */}
            <h3 className="text-primary">{product.name}</h3>

            {/* Product Description */}
            <p>{product.description}</p>

            {/* Price in orange color */}
            <p className="text-warning"><strong>₱{product.price.toFixed(2)}</strong></p>

            {/* Details button */}
            <div className="mt-auto">
                <Link to={`/product/${product._id}`}>
                    <Button variant="primary" className="w-100">Details</Button>
                </Link>
            </div>
        </div>
    );
}