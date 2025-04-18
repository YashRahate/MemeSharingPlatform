import React from 'react';
import { useParams } from 'react-router-dom';
import UserProfile from '../components/User/UserProfile';

const ProfilePage = () => {
  const { userId } = useParams();
  
  return (
    <div>
      <UserProfile />
    </div>
  );
};

export default ProfilePage;