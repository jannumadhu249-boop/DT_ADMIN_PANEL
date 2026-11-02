import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function EFiledAwaitingAcceptance2({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="E - Filed & Awaiting Acceptance - 2"
      subtitle="E-filed returns awaiting IRS acceptance - Batch 2"
      statusCode="EF_AA_II"
      selectedYear={selectedYear}
    />
  );
}
