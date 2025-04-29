import { useState, useEffect, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
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
    // Attempt to log the user in
    fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/users/login/', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.access) {
        // Save the token to localStorage
        localStorage.setItem('token', data.access);
        // Retrieve the user details after login
        retrieveUserDetails(data.access);

        Swal.fire({
          title: "Login Successful",
          icon: "success",
          text: "Welcome to Generix Drugstore!",
        });
      } else {
        // Show error if the login failed
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

    // Clear the form fields after attempting login
    setEmail('');
    setPassword('');
  };

  // Retrieve user details after successful login
  const retrieveUserDetails = (token) => {
    fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/users/details', {
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
    // Validation to enable submit button when all fields are populated and both passwords match
    if (email !== '' && password !== '') {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [email, password]);

  if (user && user.id) {
    // If the user is logged in, redirect to the products page
    return <Navigate to="/home" />;
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-start min-vh-100 pt-5 bg-light">
      <div className="container w-50 bg-white p-4 rounded shadow">
        <Form onSubmit={authenticate}>
          <h1 className="my-4 text-center">Login</h1>

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

          <Form.Group controlId="password" className="mt-2 mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          {isActive ? (
            <Button variant="primary" type="submit" id="submitBtn" className="w-100">
              Submit
            </Button>
          ) : (
            <Button variant="danger" type="submit" id="submitBtn" className="w-100" disabled>
              Submit
            </Button>
          )}
        </Form>
      </div>
    </div>
  );
}