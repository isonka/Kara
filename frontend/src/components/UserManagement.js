import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [membershipInfo, setMembershipInfo] = useState(null);
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    permissions: {
      canViewRecipes: true,
      canViewIngredients: true,
      canRecommendChanges: true,
      canAddToOrders: true
    }
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTeamMembers(response.data.teamMembers);
      setMembershipInfo({
        canInviteMore: response.data.canInviteMore,
        currentPlan: response.data.currentPlan,
        userLimit: response.data.userLimit,
        currentCount: response.data.currentCount
      });
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/invite`, 
        inviteForm, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert(`User invited successfully! Temporary password: ${response.data.tempPassword}`);
      setShowInviteModal(false);
      setInviteForm({
        email: '',
        firstName: '',
        lastName: '',
        permissions: {
          canViewRecipes: true,
          canViewIngredients: true,
          canRecommendChanges: true,
          canAddToOrders: true
        }
      });
      fetchTeamMembers();
    } catch (error) {
      console.error('Error inviting user:', error);
      alert(error.response?.data?.message || 'Failed to invite user');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/users/team/${userId}/deactivate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      fetchTeamMembers();
      alert('User deactivated successfully');
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Failed to deactivate user');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading team members...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Team Management</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem' }}>
            {membershipInfo?.currentPlan} Plan
          </span>
          <span>
            {membershipInfo?.currentCount} / {membershipInfo?.userLimit === -1 ? '∞' : membershipInfo?.userLimit} Users
          </span>
        </div>
      </div>

      {error && <div style={{ background: '#ffebee', color: '#d32f2f', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button 
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: membershipInfo?.canInviteMore ? 'pointer' : 'not-allowed',
            opacity: membershipInfo?.canInviteMore ? 1 : 0.6
          }}
          onClick={() => setShowInviteModal(true)}
          disabled={!membershipInfo?.canInviteMore}
        >
          + Invite Team Member
        </button>
        {!membershipInfo?.canInviteMore && (
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>User limit reached for your plan</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {teamMembers.length > 0 ? (
          teamMembers.map((member) => (
            <TeamMemberCard 
              key={member._id} 
              member={member} 
              onDeactivate={handleDeactivateUser}
            />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#6c757d' }}>
            <p>No team members yet</p>
            <p>Invite your first team member to get started</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '85vh',
            overflow: 'auto'
          }}>
            <div style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0 }}>Invite Team Member</h2>
              <button 
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                onClick={() => setShowInviteModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleInviteSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <h3>Basic Information</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Email *</label>
                  <input 
                    type="email"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    required
                    placeholder="user@example.com"
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>First Name</label>
                    <input 
                      type="text"
                      style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                      value={inviteForm.firstName}
                      onChange={(e) => setInviteForm({...inviteForm, firstName: e.target.value})}
                      placeholder="John"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Last Name</label>
                    <input 
                      type="text"
                      style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                      value={inviteForm.lastName}
                      onChange={(e) => setInviteForm({...inviteForm, lastName: e.target.value})}
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3>Permissions</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox"
                      checked={inviteForm.permissions.canViewRecipes}
                      onChange={(e) => setInviteForm({
                        ...inviteForm, 
                        permissions: {
                          ...inviteForm.permissions,
                          canViewRecipes: e.target.checked
                        }
                      })}
                    />
                    <span>View Recipes</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox"
                      checked={inviteForm.permissions.canViewIngredients}
                      onChange={(e) => setInviteForm({
                        ...inviteForm, 
                        permissions: {
                          ...inviteForm.permissions,
                          canViewIngredients: e.target.checked
                        }
                      })}
                    />
                    <span>View Ingredients</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox"
                      checked={inviteForm.permissions.canRecommendChanges}
                      onChange={(e) => setInviteForm({
                        ...inviteForm, 
                        permissions: {
                          ...inviteForm.permissions,
                          canRecommendChanges: e.target.checked
                        }
                      })}
                    />
                    <span>Recommend Changes</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox"
                      checked={inviteForm.permissions.canAddToOrders}
                      onChange={(e) => setInviteForm({
                        ...inviteForm, 
                        permissions: {
                          ...inviteForm.permissions,
                          canAddToOrders: e.target.checked
                        }
                      })}
                    />
                    <span>Add to Orders</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="submit" style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  Send Invitation
                </button>
                <button 
                  type="button" 
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Team Member Card Component
const TeamMemberCard = ({ member, onDeactivate }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0' }}>
            {member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unnamed User'}
          </h3>
          <p style={{ margin: '0 0 5px 0', color: '#6c757d' }}>{member.email}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#6c757d' }}>
            Joined {new Date(member.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button 
          style={{
            background: '#ffebee',
            color: '#d32f2f',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
          onClick={() => onDeactivate(member._id)}
        >
          Deactivate
        </button>
      </div>

      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Permissions</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {member.permissions.canViewRecipes && (
            <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
              View Recipes
            </span>
          )}
          {member.permissions.canViewIngredients && (
            <span style={{ background: '#e8f5e8', color: '#2e7d32', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
              View Ingredients
            </span>
          )}
          {member.permissions.canRecommendChanges && (
            <span style={{ background: '#fff3cd', color: '#856404', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
              Recommend Changes
            </span>
          )}
          {member.permissions.canAddToOrders && (
            <span style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
              Add to Orders
            </span>
          )}
        </div>
      </div>
      
      {member.lastLogin && (
        <div style={{ marginTop: '15px', fontSize: '0.8rem', color: '#6c757d' }}>
          Last login: {new Date(member.lastLogin).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default UserManagement;