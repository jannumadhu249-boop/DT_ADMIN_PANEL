import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function InfoPending({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Information Pending"
      subtitle="Members with basic information pending"
      statusCode="BIP"
      selectedYear={selectedYear}
    />
  );
}
