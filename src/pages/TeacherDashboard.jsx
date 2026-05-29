import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendancePercentage: 0,
    dailyTrend: []
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, sessionsRes] = await Promise.all([
        api.get('/attendance/analytics'),
        api.get('/attendance/sessions')
      ]);
      setStats(analyticsRes.data);
      setRecentSessions(sessionsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: stats.dailyTrend.map(d => d.attendance_date).reverse(),
    datasets: [
      {
        label: 'Present Students',
        data: stats.dailyTrend.map(d => d.count).reverse(),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.4
      }
    ]
  };

  const doughnutData = {
    labels: ['Present Today', 'Absent Today'],
    datasets: [
      {
        data: [stats.presentToday, stats.absentToday],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgb(16, 185, 129)', 'rgb(239, 68, 68)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container fluid className="fade-in py-3">
      <Row className="mb-4">
        <Col>
          <h2 className="brand-text">Dashboard Analytics</h2>
          <p className="text-muted">Overview of student attendance and system activity.</p>
        </Col>
      </Row>

      {/* Stats Row */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="glass-card text-center h-100 border-primary border-top border-3">
            <Card.Body>
              <h1 className="display-5 fw-bold text-primary">{stats.totalStudents}</h1>
              <Card.Title className="text-muted fs-6 text-uppercase">Total Students</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="glass-card text-center h-100 border-success border-top border-3">
            <Card.Body>
              <h1 className="display-5 fw-bold text-success">{stats.presentToday}</h1>
              <Card.Title className="text-muted fs-6 text-uppercase">Present Today</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="glass-card text-center h-100 border-danger border-top border-3">
            <Card.Body>
              <h1 className="display-5 fw-bold text-danger">{stats.absentToday}</h1>
              <Card.Title className="text-muted fs-6 text-uppercase">Absent Today</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="glass-card text-center h-100 border-info border-top border-3">
            <Card.Body>
              <h1 className="display-5 fw-bold text-info">{stats.attendancePercentage}%</h1>
              <Card.Title className="text-muted fs-6 text-uppercase">Attendance Rate</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col md={8} className="mb-3">
          <Card className="glass-card h-100">
            <Card.Body>
              <Card.Title className="mb-4">Attendance Trend (Last 7 Days)</Card.Title>
              <div style={{ height: '300px' }}>
                {!loading && <Line data={lineChartData} options={{ maintainAspectRatio: false }} />}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="glass-card h-100">
            <Card.Body>
              <Card.Title className="mb-4">Today's Overview</Card.Title>
              <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                 {!loading && <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Sessions Table */}
      <Row>
        <Col>
          <Card className="glass-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                 <Card.Title className="m-0">Recent Attendance Sessions</Card.Title>
                 <Link to="/teacher/sessions" className="btn btn-sm btn-outline-primary">View All</Link>
              </div>
              
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Table responsive hover className="align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Subject</th>
                      <th>Department/Year</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">No sessions created yet.</td>
                      </tr>
                    ) : (
                      recentSessions.map((session) => (
                        <tr key={session.id}>
                          <td>{session.id}</td>
                          <td className="fw-bold">{session.subject}</td>
                          <td>{session.department} / {session.year}</td>
                          <td>{new Date(session.created_at).toLocaleDateString()}</td>
                          <td>
                            {session.status === 'Active' ? (
                               <Badge bg="success" className="p-2"><i className="bi bi-record-circle-fill me-1"></i> Active</Badge>
                            ) : (
                               <Badge bg="secondary" className="p-2">Closed</Badge>
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
    </Container>
  );
};

export default TeacherDashboard;
