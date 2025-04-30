import { useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, NavLink } from 'react-router-dom';
import UserContext from '../UserContext';
import logo from '../assets/logo.png';

export default function AppNavbar() {
	const { user } = useContext(UserContext);

	return (
		<Navbar bg="primary" expand="lg" variant="dark">
			<Container fluid>
				<Navbar.Brand as={Link} to="/products/" className="d-flex align-items-center">
					<img
						src={logo}
						alt="Generix Logo"
						width="40"
						height="40"
						className="d-inline-block align-top me-2 rounded-circle"
					/>
					<span>GENERIX DRUGSTORE</span>
				</Navbar.Brand>

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
										<Nav.Link as={Link} to="/my-orders" exact="true">Order History</Nav.Link>
										<Nav.Link as={Link} to="/profile" exact="true">Profile</Nav.Link>
									</>
								)}

								{user.isAdmin && (
									<>
										<Nav.Link as={Link} to="/admin" exact="true">Admin Dashboard</Nav.Link>
										<Nav.Link as={Link} to="/set-as-admin" exact="true">Set Admin</Nav.Link>
									</>
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