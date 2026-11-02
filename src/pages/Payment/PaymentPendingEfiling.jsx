import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function PaymentPendingEfiling({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Payment Pending - Efiling"
      subtitle="E-filing returns with payment pending"
      statusCode="PP_EF"
      selectedYear={selectedYear}
    />
  );
}
