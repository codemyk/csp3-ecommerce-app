import { useState, useEffect, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import UserContext from '../UserContext';

export default function Register() {
	const { user } = useContext(UserContext);

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [mobileNo, setMobileNo] = useState("");

	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		// Activate submit if all fields are filled and passwords match
		if (
			firstName && 
			lastName && 
			email && 
			mobileNo && 
			password && 
			confirmPassword && 
			password === confirmPassword
		) {
			setIsActive(true);
		} else {
			setIsActive(false);
		}
	}, [firstName, lastName, email, mobileNo, password, confirmPassword]);

	const registerUser = (e) => {
		e.preventDefault();

		fetch('https://vyi3ev2j8b.execute-api.us-west-2.amazonaws.com/production/users/register/', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				firstName,
				lastName,
				email,
				password,
				mobileNo
			})
		})
		.then(res => res.json())
		.then(data => {
			if (data.message === "Registered Successfully") {
				// Clear fields after successful registration
				setFirstName('');
				setLastName('');
				setEmail('');
				setPassword('');
				setConfirmPassword('');
				setMobileNo('');

				Swal.fire({
					title: "Registration Successful",
					icon: "success",
					text: "Thank you for registering!"
				});
			} else {
				Swal.fire({
					title: "Something went wrong.",
					icon: "error",
					text: data.error || "Please try again later or contact support."
				});
			}
		})
		.catch(error => {
			console.error('Error during registration:', error);
			Swal.fire({
				title: "Network Error",
				icon: "error",
				text: "Please check your connection and try again."
			});
		});
	};

	return (
		(user.id !== null) ? 
			<Navigate to="/courses" /> 
		: (
			<Form onSubmit={registerUser} className="p-4 rounded shadow-sm">
				<h1 className="my-4 text-center">Register</h1>

				<Form.Group className="mb-3">
					<Form.Label>First Name:</Form.Label>
					<Form.Control
						type="text"
						placeholder="Enter First Name"
						required
						value={firstName}
						onChange={e => setFirstName(e.target.value)}
					/>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Last Name:</Form.Label>
					<Form.Control
						type="text"
						placeholder="Enter Last Name"
						required
						value={lastName}
						onChange={e => setLastName(e.target.value)}
					/>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Email:</Form.Label>
					<Form.Control
						type="email"
						placeholder="Enter Email"
						required
						value={email}
						onChange={e => setEmail(e.target.value)}
					/>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Mobile Number:</Form.Label>
					<Form.Control
						type="text"
						placeholder="Enter Mobile Number (e.g., 09123456789)"
						required
						value={mobileNo}
						onChange={e => setMobileNo(e.target.value)}
					/>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Password:</Form.Label>
					<Form.Control
						type="password"
						placeholder="Enter Password (min 8 characters)"
						required
						value={password}
						onChange={e => setPassword(e.target.value)}
					/>
				</Form.Group>

				<Form.Group className="mb-4">
					<Form.Label>Confirm Password:</Form.Label>
					<Form.Control
						type="password"
						placeholder="Confirm Password"
						required
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
					/>
				</Form.Group>

				<div className="d-grid">
					<Button 
						variant="primary" 
						type="submit" 
						disabled={!isActive}
					>
						Register
					</Button>
				</div>
			</Form>
		)
	);
}