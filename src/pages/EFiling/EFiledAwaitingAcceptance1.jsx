import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function EFiledAwaitingAcceptance1({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="E - Filed & Awaiting Acceptance - 1"
      subtitle="E-filed returns awaiting IRS acceptance - Batch 1"
      statusCode="EF_AA_I"
      selectedYear={selectedYear}
    />
  );
}
