import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import api from '../services/api';

const AddStudent = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [photo, setPhoto] = useState(null);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setName(student.name || '');
    setRollNumber(student.roll_number || '');
    setDepartment(student.department || '');
    setYear(student.year || '');
    setMessage('');
    setError('');
    setPhoto(null);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.put(`/students/${selectedStudent.id}`, {
        name, roll_number: rollNumber, department, year
      });
      
      // If photo is selected, upload it too
      if (photo) {
        const formData = new FormData();
        formData.append('photo', photo);
        await api.post(`/students/${selectedStudent.id}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setMessage('Student profile updated successfully!');
      fetchStudents(); // Refresh list
    } catch (err) {
      setError('Failed to update student profile.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="fade-in">
      <Row className="mb-4">
        <Col>
          <h2 className="brand-text">Manage Student Profiles</h2>
          <p className="text-muted">Select a registered student to complete their profile and add a face image.</p>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Card className="glass-card mb-4">
            <Card.Body>
              <Card.Title>Registered Students</Card.Title>
              <ListGroup variant="flush" className="mt-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {students.map(student => (
                  <ListGroup.Item 
                    key={student.id}
                    action
                    active={selectedStudent?.id === student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="d-flex justify-content-between align-items-start"
                  >
                    <div>
                      <div className="fw-bold">{student.email}</div>
                      <small className="text-muted">{student.name || 'Incomplete Profile'}</small>
                    </div>
                    {student.photo_path && <span title="Photo uploaded">📸</span>}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="glass-card">
            <Card.Body>
              {selectedStudent ? (
                <>
                  <Card.Title className="mb-4">Edit Profile: {selectedStudent.email}</Card.Title>
                  
                  {message && <Alert variant="success">{message}</Alert>}
                  {error && <Alert variant="danger">{error}</Alert>}

                  <Form onSubmit={handleUpdateProfile}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-control-custom"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Roll Number</Form.Label>
                          <Form.Control
                            type="text"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            className="form-control-custom"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Form.Control
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="form-control-custom"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Year</Form.Label>
                          <Form.Control
                            type="text"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="form-control-custom"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label>Face Image (Required for Attendance)</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files[0])}
                        className="form-control-custom"
                      />
                      <Form.Text className="text-muted">
                        Upload a clear, front-facing photo of the student.
                        {selectedStudent.photo_path && ' (A photo is already uploaded, selecting a new one will replace it).'}
                      </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading} className="btn-primary-custom">
                      {loading ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </Form>
                </>
              ) : (
                <div className="text-center py-5 text-muted">
                  <h5>Select a student from the list to edit their profile.</h5>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddStudent;
