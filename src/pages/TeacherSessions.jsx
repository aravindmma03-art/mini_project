import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import api from '../services/api';

const TeacherSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ subject: '', department: '', year: '' });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/attendance/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance/session', formData);
      setShowModal(false);
      setFormData({ subject: '', department: '', year: '' });
      fetchSessions();
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start session.');
    }
  };

  const handleCloseSession = async (id) => {
    if (!window.confirm('Are you sure you want to close this session?')) return;
    try {
      await api.put(`/attendance/session/${id}/close`);
      fetchSessions();
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  return (
    <Container fluid className="fade-in py-3">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="brand-text m-0"><i className="bi bi-camera-video"></i> Live Attendance Sessions</h2>
          <p className="text-muted m-0 mt-1">Manage class attendance sessions for your students.</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" className="btn-primary-custom" onClick={() => setShowModal(true)}>
            <i className="bi bi-play-circle me-2"></i> Start New Session
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="glass-card">
            <Card.Body>
              {loading ? (
                <p>Loading sessions...</p>
              ) : (
                <Table responsive hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Subject</th>
                      <th>Department & Year</th>
                      <th>Started At</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">No attendance sessions found.</td>
                      </tr>
                    ) : (
                      sessions.map((session) => (
                        <tr key={session.id}>
                          <td>{session.id}</td>
                          <td className="fw-bold">{session.subject}</td>
                          <td>{session.department} - {session.year}</td>
                          <td>{new Date(session.created_at).toLocaleString()}</td>
                          <td>
                            {session.status === 'Active' ? (
                               <Badge bg="success" className="p-2"><i className="bi bi-record-circle-fill me-1"></i> Active</Badge>
                            ) : (
                               <Badge bg="secondary" className="p-2">Closed</Badge>
                            )}
                          </td>
                          <td>
                            {session.status === 'Active' && (
                              <Button variant="outline-danger" size="sm" onClick={() => handleCloseSession(session.id)}>
                                Close Session
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Start Session Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Start Attendance Session</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStartSession}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Subject Name</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="e.g. Data Structures"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                placeholder="e.g. Computer Science"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Year</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                placeholder="e.g. 3rd Year"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="btn-primary-custom">Start Session</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default TeacherSessions;
