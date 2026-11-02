import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function DocumentPending({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Document Pending"
      subtitle="Members with documents pending"
      statusCode="DP"
      selectedYear={selectedYear}
    />
  );
}
