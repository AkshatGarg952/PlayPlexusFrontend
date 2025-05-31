// Profile.jsx
import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const Profile = ({ user, team }) => {
  const token = localStorage.getItem('token');
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(
    user ? user.profileImage : team ? team.logo : ''
  );
  const fileInputRef = useRef(null);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset preview to original image
    setProfilePicPreview(user ? user.profileImage : team ? team.logo : '');
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Append profile image manually if needed
  if (fileInputRef.current && fileInputRef.current.files[0]) {
    formData.set('profileImage', fileInputRef.current.files[0]);
  }

  const updateUrl = user
    ? `https://playplexusbackend.onrender.com/api/users/update/${entity._id}`
    : `https://playplexusbackend.onrender.com/api/teams/update/${entity._id}`;

  try {
    const response = await fetch(updateUrl, {
      method: 'POST',
      body: formData,
      headers: {
      'Authorization': `Bearer ${token}`
    }
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    window.location.reload();

    

  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Something went wrong. Please try again.');
  }
};


  const entity = user || team;

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>Edit <span className="highlight">Profile</span></h1>
      </div>
      <div className="edit-profile-container">
        {/* Profile Display */}
        <div id="profileDisplay" className={`profile-display ${isEditing ? 'hidden' : ''}`}>
          <div className="profile-pic-section">
            <div className="user-avatar">
              <img
                src={entity.profileImage || entity.logo}
                alt={entity.username || entity.name}
                id="displayProfilePic"
              />
            </div>
          </div>
          <div className="profile-info">
            <div className="detail-item">
              <strong>Name:</strong> <span id="displayName">{entity.name}</span>
            </div>
            <div className="detail-item">
              <strong>Username:</strong> <span id="displayUsername">{user ? entity.username : entity.leader}</span>
            </div>
            <div className="detail-item">
              <strong>Email:</strong> <span id="displayEmail">{entity.email}</span>
            </div>
            <div className="detail-item">
              <strong>Bio:</strong> <span id="displayBio">{entity.bio}</span>
            </div>
            <div className="detail-item">
              <strong>Phone:</strong> <span id="displayPhone">{entity.phone}</span>
            </div>
           <div className="detail-item">
  <strong>Sports:</strong>{' '}
  <span id="displaySports">
    {Array.isArray(entity.sports) ? entity.sports.join(', ') : entity.sports}
  </span>
</div>

<div className="detail-item">
  <strong>Online Games:</strong>{' '}
  <span id="displayOnlineGames">
    {Array.isArray(entity.onlineGames) ? entity.onlineGames.join(', ') : entity.onlineGames}
  </span>
</div>

            <div className="detail-item">
              <strong>Location:</strong> <span id="displayLocation">{entity.location}</span>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-submit" onClick={handleEditProfile}>
              Update Profile
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div id="editProfileSection" className={`edit-profile-form ${isEditing ? '' : 'hidden'}`}>
          <form
            id="editProfileForm"
            action={user ? `https://playplexusbackend.onrender.com/api/users/update/${entity._id}` : `http://localhost:5000/api/teams/update/${entity._id}`}
            method="POST"
            onSubmit={handleSubmit}
          >
            <div className="profile-pic-section">
              <div className="user-avatar">
                <img
                  src={profilePicPreview}
                  alt={user ? entity.username : entity.name}
                  id="profilePicPreview"
                />
              </div>
              <input
                type="file"
                name="profileImage"
                id="profilePicInput"
                accept="image/*"
                className="form-input"
                ref={fileInputRef}
                onChange={handleProfilePicChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder={user ? "Enter your name" : "Enter your Team name"}
                defaultValue={entity.name}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name={user ? "username" : "leader"}
                placeholder={user ? "Enter your username" : "Enter your leader's name"}
                defaultValue={user ? entity.username : entity.leader}
                required
              />
 лежит            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                defaultValue={entity.email}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                defaultValue={entity.phone}
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Enter your location"
                defaultValue={entity.location}
              />
            </div>
            <div className="form-group">
              <label htmlFor="sports">Sports (comma-separated)</label>
              <input
                type="text"
                id="sports"
                name="sports"
                placeholder="e.g., Football, Basketball"
                defaultValue={entity.sports}
              />
            </div>
            <div className="form-group">
              <label htmlFor="onlineGames">Online Games (comma-separated)</label>
              <input
                type="text"
                id="onlineGames"
                name="onlineGames"
                placeholder="e.g., Fortnite, Valorant"
                defaultValue={entity.onlineGames}
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself"
                rows="4"
                defaultValue={entity.bio}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Profile;