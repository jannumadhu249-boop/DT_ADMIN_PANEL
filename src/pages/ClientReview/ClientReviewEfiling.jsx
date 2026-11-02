import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function ClientReviewEfiling({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Client Review - Efiling"
      subtitle="E-filing returns under client review"
      statusCode="CR_EF"
      selectedYear={selectedYear}
    />
  );
}
