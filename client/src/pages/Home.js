import { Button, Row, Col, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../App.css';
import logo from '../assets/logo.png';

export default function Home() {
    return (
        <div className="home-centered py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} md={8} lg={6} className="text-center home-card">
                        <img src={logo} alt="Generix Logo" className="img-fluid home-logo mb-4" />
                        <h1 className="mb-3">Welcome to Generix Drugstore</h1>
                        <p className="mb-4">Your one stop shop for your medical needs</p>
                        <Link className="btn btn-primary" to="/products/">Check our Products</Link>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}