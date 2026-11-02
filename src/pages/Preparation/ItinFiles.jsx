import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function ItinFiles({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="ITIN Files"
      subtitle="Tax returns requiring ITIN application or filing"
      statusCode="ITIN"
      selectedYear={selectedYear}
    />
  );
}
