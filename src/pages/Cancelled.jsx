import React from 'react';
import MemberTableLayout from '../components/MemberTableLayout';

export default function Cancelled({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Cancelled"
      subtitle="Cancelled member registrations"
      statusCode="CANC"
      selectedYear={selectedYear}
    />
  );
}
