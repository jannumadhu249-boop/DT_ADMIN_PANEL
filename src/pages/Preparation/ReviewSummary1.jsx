import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function ReviewSummary1({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Review & Summary 1"
      subtitle="Tax Review and Summary - Stage 1"
      statusCode="TR_S_I"
      selectedYear={selectedYear}
    />
  );
}
