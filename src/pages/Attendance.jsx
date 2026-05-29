import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Modal } from 'react-bootstrap';
import api from '../services/api';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Manual Override State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const url = dateFilter ? `/attendance?date=${dateFilter}` : '/attendance';
      const response = await api.get(url);
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const url = dateFilter ? `/attendance/export/csv?date=${dateFilter}` : '/attendance/export/csv';
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'attendance.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export CSV');
    }
  };

  const handleExportExcel = async () => {
    try {
      const url = dateFilter ? `/attendance/export/excel?date=${dateFilter}` : '/attendance/export/excel';
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'attendance.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export Excel failed', error);
      alert('Failed to export Excel');
    }
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setNewStatus(record.status);
    setShowEditModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put('/attendance/manual', {
        attendance_id: editingRecord.id,
        status: newStatus
      });
      setShowEditModal(false);
      fetchAttendance(); // refresh
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <Container fluid className="fade-in py-3">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="brand-text m-0"><i className="bi bi-list-check"></i> Attendance Records</h2>
          <p className="text-muted m-0 mt-1">View, filter, export, and manually override attendance logs.</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="glass-card">
            <Card.Body className="d-flex justify-content-between align-items-end flex-wrap gap-3">
              <Form.Group style={{ minWidth: '250px' }}>
                <Form.Label>Filter by Date</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="date" 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="form-control-custom"
                  />
                  {dateFilter && (
                    <Button variant="outline-secondary" onClick={() => setDateFilter('')}>Clear</Button>
                  )}
                </div>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="outline-success" onClick={handleExportExcel}>
                  <i className="bi bi-file-earmark-excel me-2"></i> Export Excel
                </Button>
                <Button variant="outline-primary" onClick={handleExportCSV}>
                  <i className="bi bi-filetype-csv me-2"></i> Export CSV
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="glass-card">
            <Card.Body>
              {loading ? (
                <p>Loading records...</p>
              ) : (
                <Table responsive hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Student Name</th>
                      <th>Roll No</th>
                      <th>Department & Year</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-muted">No attendance records found.</td>
                      </tr>
                    ) : (
                      attendanceRecords.map((record) => (
                        <tr key={record.id}>
                          <td>{record.id}</td>
                          <td className="fw-bold">{record.Student?.name || 'Unknown'}</td>
                          <td>{record.Student?.roll_number || 'N/A'}</td>
                          <td>{record.Student?.department} / {record.Student?.year}</td>
                          <td>{record.subject}</td>
                          <td>{new Date(record.attendance_date).toLocaleDateString()}</td>
                          <td>{record.attendance_time}</td>
                          <td>
                            <Badge bg={record.status === 'Present' ? 'success' : record.status === 'Absent' ? 'danger' : 'warning'}>
                              {record.status}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="link" size="sm" onClick={() => openEditModal(record)}>
                              <i className="bi bi-pencil-square"></i> Edit
                            </Button>
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

      {/* Edit Status Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Manual Override</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateStatus}>
          <Modal.Body>
            {editingRecord && (
              <div className="mb-3">
                <p><strong>Student:</strong> {editingRecord.Student?.name}</p>
                <p><strong>Subject:</strong> {editingRecord.subject}</p>
                <p><strong>Date:</strong> {editingRecord.attendance_date}</p>
              </div>
            )}
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="btn-primary-custom">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
};

export default Attendance;
