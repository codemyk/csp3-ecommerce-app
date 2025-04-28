import { Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Home() {


    return (
        <Row>
            <Col className="mt-5 pt-5 text-center mx-auto">
                <h1>Welcome to Generix Drugstore</h1>
                <p>Your one stop shop for your medical needs</p>
                <Link className="btn btn-primary" to={"/products/"}>Check our Products</Link>
            </Col>
        </Row>
    )
}