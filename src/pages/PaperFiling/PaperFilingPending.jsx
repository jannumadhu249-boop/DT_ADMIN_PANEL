import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function PaperFilingPending({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Paper Filing Pending"
      subtitle="Pending paper filing tax returns"
      statusCode="PF_P"
      selectedYear={selectedYear}
    />
  );
}
