import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./users.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UsersManager = () => {
  const { token } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "student",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data.users);
      else throw new Error(data.message || "Failed to fetch users");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add/Edit Modal
  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "",
        passwordConfirm: "",
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirm: "",
        role: "student",
      });
    }
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");

    const url = editingUser ? `${BACKEND_URL}/users/${editingUser.id}` : `${BACKEND_URL}/users`;
    const method = editingUser ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save user");
      setMessage(editingUser ? "✅ User updated!" : "✅ User created!");
      closeModal(); fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      setMessage("✅ User deleted successfully"); fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // View Profile Modal
  const handleViewProfile = async (user) => {
    if (!user?.id) return;
    setError("");
    try {
      let endpoint = "";
      switch (user.role) {
        case "student": endpoint = `/student/profile`; break;
        case "institution": endpoint = `/institution/profile`; break;
        case "company": endpoint = `/company/profile`; break;
        case "admin": endpoint = `/admin/profile`; break;
        default: throw new Error("Unknown role");
      }
      const res = await fetch(`${BACKEND_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
      const profile = data.profiles ? data.profiles[0] : data.profile || null;
      setViewProfile(profile);
    } catch (err) {
      setError(err.message);
    }
  };
  const closeProfileModal = () => setViewProfile(null);

  return (
    <div className="users-wrapper">
      <div className="users-header">
        <h1>User Management</h1>
        <button className="add-user-btn" onClick={() => openModal()}>+ Add User</button>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {/* Horizontal User List */}
      <div className="users-list-horizontal">
        <div className="user-row header-row">
          <div>Name</div><div>Email</div><div>Role</div><div>Created</div><div>Actions</div>
        </div>
        {loading ? <p>Loading users...</p> :
          users.length === 0 ? <p>No users found.</p> :
          users.map((user) => (
            <div key={user.id} className="user-row">
              <div>{user.firstName} {user.lastName}</div>
              <div>{user.email}</div>
              <div>{user.role}</div>
              <div>{new Date(user.createdAt._seconds*1000).toLocaleString()}</div>
              <div className="row-actions">
                <button onClick={() => openModal(user)} className="edit-btn">Edit</button>
                <button onClick={() => handleDelete(user.id)} className="delete-btn">Delete</button>
                <button onClick={() => handleViewProfile(user)} className="view-btn">View Profile</button>
              </div>
            </div>
          ))
        }
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingUser ? "Edit User" : "Add User"}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
              <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="institution">Institution</option>
                <option value="company">Company</option>
                <option value="admin">Admin</option>
              </select>
              <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required={!editingUser} />
              <input type="password" name="passwordConfirm" placeholder="Confirm Password" value={form.passwordConfirm} onChange={handleChange} required={!editingUser} />
              <div className="modal-buttons">
                <button type="submit" className="save-btn">{editingUser ? "Update" : "Create"}</button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {viewProfile && (
        <div className="modal-overlay">
          <div className="modal-content profile-view-modal">
            <h2>Profile Details</h2>
            {viewProfile.profilePic && <img src={viewProfile.profilePic} alt="Profile" className="profile-pic" />}
            <div className="profile-row">
              <div><strong>Name:</strong> {viewProfile.userInfo?.firstName} {viewProfile.userInfo?.lastName}</div>
              <div><strong>Email:</strong> {viewProfile.userInfo?.email}</div>
              <div><strong>Role:</strong> {viewProfile.userInfo?.role}</div>
              {viewProfile.institution && <div><strong>Institution:</strong> {viewProfile.institution}</div>}
              {viewProfile.course && <div><strong>Course:</strong> {viewProfile.course}</div>}
              {viewProfile.yearOfStudy && <div><strong>Year:</strong> {viewProfile.yearOfStudy}</div>}
              {viewProfile.bio && <div><strong>Bio:</strong> {viewProfile.bio}</div>}
              {viewProfile.skills && <div><strong>Skills:</strong> {viewProfile.skills.join(", ")}</div>}
              {viewProfile.resumeUrl && <div><strong>Resume:</strong> <a href={viewProfile.resumeUrl} target="_blank" rel="noreferrer">View</a></div>}
            </div>
            <button onClick={closeProfileModal} className="close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
