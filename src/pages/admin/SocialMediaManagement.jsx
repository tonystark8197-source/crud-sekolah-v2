import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import SocialMediaSettings from '../../components/admin/SocialMediaSettings';

const SocialMediaManagement = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <SocialMediaSettings />
      </div>
    </AdminLayout>
  );
};

export default SocialMediaManagement;
