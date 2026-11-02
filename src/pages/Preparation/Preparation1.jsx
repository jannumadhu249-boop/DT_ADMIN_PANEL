import React from 'react';
import MemberTableLayout from '../../components/MemberTableLayout';

export default function Preparation1({ selectedYear = '' }) {
  return (
    <MemberTableLayout
      title="Preparation - 1"
      subtitle="Returns in initial preparation stage"
      statusCode="PP_I"
      selectedYear={selectedYear}
    />
  );
}
