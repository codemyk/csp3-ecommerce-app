import { useEffect, useState, useContext } from 'react';
import ProductCard from '../components/ProductCard';
import UserContext from '../UserContext';
import { Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Products() {
    const { user } = useContext(UserContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = () => {
        setLoading(true);
        setError(null);

        fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/products/active', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch active products');
            }
            return res.json();
        })
        .then(data => {
            console.log('Fetched Data:', data);  // Log the full response to inspect
            const fetchedProducts = Array.isArray(data) ? data : [];
            console.log('Fetched Products:', fetchedProducts);  // Ensure products array is populated
            setProducts(fetchedProducts);
            setLoading(false);
        })
        .catch(error => {
            setError(error.message);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []); // Empty dependency array to run on mount only

    if (!user) {
        return (
            <>
                <h1>You are not logged in</h1>
                <Link className="btn btn-primary" to={"/login"}>Login to View</Link>
            </>
        );
    }

    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p>Loading products...</p>
            </div>
        );
    }

    if (error) {
        return <h1>Error: {error}</h1>;
    }

    return (
        <>
          {products.length > 0 ? (
            <>
              <h1 className="text-center mt-5">Active Products</h1>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4 p-4">
                {products.map(product => (
                  <div className="col" key={product._id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <h1 className="text-center mt-5">No Active Products Available</h1>
          )}
        </>
    );
}