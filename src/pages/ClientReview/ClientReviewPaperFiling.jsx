import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function ClientReviewPaperFiling({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Client Review - Paper Filing"
      subtitle="Paper filing returns under client review"
      statusCode="CR_PF"
      selectedYear={selectedYear}
    />
  );
}
