import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function ReviewSummary2({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Review & Summary 2"
      subtitle="Tax Review and Summary - Stage 2"
      statusCode="TR_S_II"
      selectedYear={selectedYear}
    />
  );
}
