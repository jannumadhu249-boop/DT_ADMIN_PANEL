import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function InterviewPending({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Interview Pending"
      subtitle="Members awaiting interview completion"
      statusCode="IP"
      selectedYear={selectedYear}
    />
  );
}
