import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Error from './pages/Error';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Register from './pages/Register';
import ProductCatalog from './pages/ProductCatalog';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import { UserProvider } from './UserContext';
import ProductDetails from './pages/ProductDetails';
import CheckOut from './pages/CheckOut';
import './App.css';

function App() {
  const [user, setUser] = useState({
    id: null,
    isAdmin: false
  });

  const unsetUser = () => {
    localStorage.clear();
    setUser({ id: null, isAdmin: false });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      fetch(`https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/users/details`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch user details');
        }
        return res.json();
      })
      .then(data => {
        if (data._id) {
          setUser({
            id: data._id,
            isAdmin: data.isAdmin
          });
        } else {
          setUser({ id: null, isAdmin: false });
        }
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
        unsetUser();
      });
    }
  }, []);

  return (
    <UserProvider value={{ user, setUser, unsetUser }}>
      <Router>
        <AppNavbar />
        <Container>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/all" element={<ProductCatalog />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/checkout" element={<CheckOut />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </Container>
      </Router>
    </UserProvider>
  );
}

export default App;