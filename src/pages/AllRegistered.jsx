import React from 'react';
import MemberTableLayout from '../components/MemberTableLayout';

export default function AllRegistered({ selectedYear = '', refreshKey }) {
  const displayTitle = selectedYear ? `${selectedYear} All Registered Members` : 'All Registered Members';
  return (
    <MemberTableLayout
      title={displayTitle}
      subtitle="Overview of all registered member tax returns"
      statusCode="all"
      selectedYear={selectedYear}
      refreshKey={refreshKey}
    />
  );
}