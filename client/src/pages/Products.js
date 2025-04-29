import { useEffect, useState, useContext } from 'react';
import ProductCard from '../components/ProductCard';
import UserContext from '../UserContext';
import { Row, Col, Spinner, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../App.css';

export default function Products() {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchData = () => {
    setLoading(true);
    setError(null);

    fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/products/active', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch active products');
        }
        return res.json();
      })
      .then((data) => {
        const fetchedProducts = Array.isArray(data) ? data : [];
        setProducts(fetchedProducts);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!user) {
    return (
      <>
        <h1>You are not logged in</h1>
        <Link className="btn btn-primary" to={'/login'}>
          Login to View
        </Link>
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

  const filteredAndSortedProducts = products
    .filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  return (
    <>
      <h1 className="text-center mt-5">Active Products</h1>

      <Form className="mb-4">
        <Row className="gy-2 gx-3 align-items-center justify-content-center">
          <Col xs={12} md={6}>
            <Form.Label htmlFor="searchInput" visuallyHidden>
              Search
            </Form.Label>
            <Form.Control
              id="searchInput"
              type="text"
              placeholder="🔍 Search products by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>

          <Col xs={12} md={4}>
            <Form.Label htmlFor="sortSelect" visuallyHidden>
              Sort
            </Form.Label>
            <Form.Select id="sortSelect" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Sort A–Z</option>
              <option value="desc">Sort Z–A</option>
            </Form.Select>
          </Col>
        </Row>
      </Form>

      {filteredAndSortedProducts.length > 0 ? (
        <Row className="g-4">
          {filteredAndSortedProducts.map((product) => (
            <Col key={product._id} xs={12} sm={6} md={4} lg={3} className="d-flex">
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      ) : (
        <h4 className="text-center mt-4">No matching products found.</h4>
      )}
    </>
  );
}