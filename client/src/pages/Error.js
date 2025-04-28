import { Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Error() {


    return (
        <Row>
            <Col className="mt-5 pt-5 text-center mx-auto">
                <h1>404 Error</h1>
                <p>Page Not Found</p>
                <Link className="btn btn-primary" to={"/home"}>Return to Home</Link>
            </Col>
        </Row>
    )
}