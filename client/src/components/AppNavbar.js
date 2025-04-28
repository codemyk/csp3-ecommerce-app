import { useState, useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, NavLink } from 'react-router-dom';
import UserContext from '../UserContext';

export default function AppNavbar() {
	const { user } = useContext(UserContext);

	return (
		<Navbar bg="primary" expand="lg" variant="dark">
			<Container fluid>
				<Navbar.Brand as={Link} to="/products/">GENERIX DRUGSTORE</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ms-auto">
						<Nav.Link as={NavLink} to="/home" exact="true">Home</Nav.Link>

						{(user.id !== null) ? (
							<>
								{!user.isAdmin && (
									<>
										<Nav.Link as={Link} to="/products/" exact="true">Products</Nav.Link>
										<Nav.Link as={Link} to="/cart" exact="true">My Cart</Nav.Link>
									</>
								)}

								{user.isAdmin && (
									<Nav.Link as={Link} to="/admin" exact="true">Admin Dashboard</Nav.Link>
								)}

								<Nav.Link as={Link} to="/logout" exact="true">Logout</Nav.Link>
							</>
						) : (
							<>
								<Nav.Link as={Link} to="/login" exact="true">Login</Nav.Link>
								<Nav.Link as={Link} to="/register" exact="true">Register</Nav.Link>
							</>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}