import { Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../App.css';
import logo from '../assets/logo.png';

export default function Home() {
    return (
        <div className="home-centered">
            <Row>
                <Col className="text-center mx-auto home-card">
                    <img src={logo} alt="Generix Logo" className="home-logo" />
                    <h1>Welcome to Generix Drugstore</h1>
                    <p>Your one stop shop for your medical needs</p>
                    <Link className="btn btn-primary" to={"/products/"}>Check our Products</Link>
                </Col>
            </Row>
        </div>
    );
}