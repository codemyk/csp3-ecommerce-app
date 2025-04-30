import { useState, useEffect, useContext } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Navigate } from 'react-router-dom'; 
import Swal from 'sweetalert2';
import UserContext from '../UserContext';

export default function Login() {
  const { user, setUser } = useContext(UserContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);

  const authenticate = (e) => {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/login/`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.access) {
        localStorage.setItem('token', data.access);
        retrieveUserDetails(data.access);

        Swal.fire({
          title: "Login Successful",
          icon: "success",
          text: "Welcome to Generix Drugstore!",
        });
      } else {
        Swal.fire({
          title: "Authentication failed",
          icon: "error",
          text: "Check your login details and try again.",
        });
      }
    })
    .catch((err) => {
      console.error("Login error: ", err);
      Swal.fire({
        title: "An error occurred",
        icon: "error",
        text: "Please try again later.",
      });
    });

    setEmail('');
    setPassword('');
  };

  const retrieveUserDetails = (token) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.json())
    .then((data) => {
      setUser({
        id: data._id,
        isAdmin: data.isAdmin,
      });
    })
    .catch((err) => {
      console.error("Error retrieving user details: ", err);
    });
  };

  useEffect(() => {
    setIsActive(email !== '' && password !== '');
  }, [email, password]);

  if (user && user.id) {
    return <Navigate to="/home" />;
  }

  return (
    <Container fluid className="min-vh-80 d-flex align-items-center justify-content-center bg-light py-5">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={5} xl={4}>
          <div className="bg-white p-4 p-sm-5 rounded shadow">
            <Form onSubmit={authenticate}>
              <h1 className="mb-4 text-center">Login</h1>

              <Form.Group controlId="userEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="password" className="mt-3 mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button 
                variant={isActive ? "primary" : "danger"} 
                type="submit" 
                className="w-100" 
                disabled={!isActive}
              >
                Submit
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
