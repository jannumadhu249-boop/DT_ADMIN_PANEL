import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function FeePaymentReceived1({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Fee Payment Received - I"
      subtitle="Returns with fee payment received - Batch 1"
      statusCode="FPR"
      selectedYear={selectedYear}
    />
  );
}
