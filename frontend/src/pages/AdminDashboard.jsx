import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pitchAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard = () => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, approved

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchPitches();
  }, [user, navigate]);

  const fetchPitches = async () => {
    try {
      const response = await pitchAPI.getAllForAdmin();
      setPitches(response.data);
    } catch {
      setError("Không thể tải danh sách sân");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await pitchAPI.approve(id);
      fetchPitches();
    } catch {
      setError("Không thể duyệt sân");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sân này?")) return;

    try {
      await pitchAPI.delete(id);
      fetchPitches();
    } catch {
      setError("Không thể xóa sân");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const filteredPitches = pitches.filter((pitch) => {
    if (filter === "pending") return !pitch.isApproved;
    if (filter === "approved") return pitch.isApproved;
    return true;
  });

  if (loading) {
    return <div style={styles.loading}>Đang tải...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Quản trị sân bóng</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.filterContainer}>
        <button
          onClick={() => setFilter("all")}
          style={{
            ...styles.filterBtn,
            ...(filter === "all" ? styles.filterBtnActive : {}),
          }}
        >
          Tất cả ({pitches.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          style={{
            ...styles.filterBtn,
            ...(filter === "pending" ? styles.filterBtnActive : {}),
          }}
        >
          Chờ duyệt ({pitches.filter((p) => !p.isApproved).length})
        </button>
        <button
          onClick={() => setFilter("approved")}
          style={{
            ...styles.filterBtn,
            ...(filter === "approved" ? styles.filterBtnActive : {}),
          }}
        >
          Đã duyệt ({pitches.filter((p) => p.isApproved).length})
        </button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Tên sân</th>
              <th style={styles.th}>Loại</th>
              <th style={styles.th}>Địa chỉ</th>
              <th style={styles.th}>Giá/giờ</th>
              <th style={styles.th}>Chủ sân</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPitches.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.noData}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredPitches.map((pitch) => (
                <tr key={pitch.id} style={styles.tableRow}>
                  <td style={styles.td}>{pitch.id}</td>
                  <td style={styles.td}>
                    <strong>{pitch.name}</strong>
                  </td>
                  <td style={styles.td}>
                    {pitch.type.replace("PITCH_", "Sân ")}
                  </td>
                  <td style={styles.td}>{pitch.address}</td>
                  <td style={styles.td}>{formatPrice(pitch.pricePerHour)}</td>
                  <td style={styles.td}>{pitch.ownerName}</td>
                  <td style={styles.td}>
                    {pitch.isApproved ? (
                      <span style={styles.statusApproved}>✓ Đã duyệt</span>
                    ) : (
                      <span style={styles.statusPending}>⏳ Chờ duyệt</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      {!pitch.isApproved && (
                        <button
                          onClick={() => handleApprove(pitch.id)}
                          style={styles.approveBtn}
                        >
                          ✓ Duyệt
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/pitch/${pitch.id}`)}
                        style={styles.viewBtn}
                      >
                        👁️ Xem
                      </button>
                      <button
                        onClick={() => handleDelete(pitch.id)}
                        style={styles.deleteBtn}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem 1rem",
    marginTop: "60px",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    fontSize: "1.2rem",
    color: "#1a5f2a",
  },
  title: {
    fontSize: "1.85rem",
    color: "#1a5f2a",
    fontWeight: "700",
    marginBottom: "2rem",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "1rem 1.25rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    border: "1px solid #fecaca",
  },
  filterContainer: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "2rem",
    backgroundColor: "#f0fdf4",
    padding: "0.75rem",
    borderRadius: "14px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "0.75rem 1.5rem",
    border: "none",
    backgroundColor: "transparent",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#1a5f2a",
    transition: "all 0.3s ease",
  },
  filterBtnActive: {
    background: "linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)",
    color: "white",
    boxShadow: "0 4px 15px rgba(26, 95, 42, 0.3)",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(26, 95, 42, 0.1)",
    overflow: "auto",
    border: "1px solid rgba(26, 95, 42, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "linear-gradient(135deg, #1a5f2a 0%, #2d8a42 100%)",
    color: "white",
  },
  th: {
    padding: "1.1rem 1rem",
    textAlign: "left",
    fontWeight: "600",
  },
  tableRow: {
    borderBottom: "1px solid #e8f5e9",
    transition: "background-color 0.2s ease",
  },
  td: {
    padding: "1rem",
  },
  noData: {
    textAlign: "center",
    padding: "3rem",
    color: "#1a5f2a",
  },
  statusApproved: {
    color: "#16a34a",
    fontWeight: "700",
    backgroundColor: "#f0fdf4",
    padding: "0.35rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    display: "inline-block",
  },
  statusPending: {
    color: "#d97706",
    fontWeight: "700",
    backgroundColor: "#fef3c7",
    padding: "0.35rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    display: "inline-block",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
  },
  approveBtn: {
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    color: "white",
    border: "none",
    padding: "0.5rem 0.85rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  viewBtn: {
    backgroundColor: "#e8f5e9",
    color: "#1a5f2a",
    border: "none",
    padding: "0.5rem 0.85rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  deleteBtn: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    padding: "0.5rem 0.85rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
};

export default AdminDashboard;
