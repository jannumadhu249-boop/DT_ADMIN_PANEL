import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function CityReturn({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="City Return"
      subtitle="Members with city tax return filings"
      statusCode="C_R"
      selectedYear={selectedYear}
    />
  );
}
