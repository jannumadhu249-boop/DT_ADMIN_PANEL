import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function RevisedEstimate({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Revised Estimate"
      subtitle="Tax returns with revised estimates"
      statusCode="RE_ES"
      selectedYear={selectedYear}
    />
  );
}
