
export const INITIAL_MEMBERS = [
  // --- PRE-PROCESSING / SCHEDULING PENDING / REGISTERED USERS ---
  { sNo: 1, name: 'Amardeep Kumar', fileNo: '31010', filingType: 'E-Filing', email: 'amardeep.k@gmail.com', regDate: '2026-06-05 09:10:48', status: 'Scheduling Pending', statusDate: '2026-06-11 22:50:13', year: '2025' },
  { sNo: 2, name: 'Narashima Vaddala', fileNo: '101570', filingType: 'E-Filing', email: 'narashima.v@yahoo.com', regDate: '2026-05-29 13:34:52', status: 'Scheduling Pending', statusDate: '2026-05-29 21:32:49', year: '2025' },
  { sNo: 3, name: 'Anubhav Yadav', fileNo: '41795', filingType: 'E-Filing', email: 'anubhav.yadav@hotmail.com', regDate: '2026-05-26 11:23:09', status: 'Scheduling Pending', statusDate: '2026-06-04 21:58:31', year: '2025' },
  { sNo: 4, name: 'Manideep Yenugula', fileNo: '63129', filingType: 'E-Filing', email: 'manideep.y@outlook.com', regDate: '2026-05-28 20:07:51', status: 'Scheduling Pending', statusDate: '2026-06-11 22:43:56', year: '2025' },
  { sNo: 5, name: 'Nitish Yadav', fileNo: '101569', filingType: 'E-Filing', email: 'nitish.yadav@gmail.com', regDate: '2026-05-28 11:23:37', status: 'Scheduling Pending', statusDate: '2026-06-04 00:16:43', year: '2025' },
  { sNo: 6, name: 'Edwin Okpobrisi', fileNo: '101568', filingType: 'E-Filing', email: 'edwin.okp@firm.org', regDate: '2026-05-27 03:36:15', status: 'Scheduling Pending', statusDate: '2026-05-27 04:02:00', year: '2025' },
  { sNo: 7, name: 'Vedant Nimbhore', fileNo: '101567', filingType: 'E-Filing', email: 'vedant.nimb@gmail.com', regDate: '2026-05-26 16:02:40', status: 'Scheduling Pending', statusDate: '2026-06-11 22:48:51', year: '2025' },
  { sNo: 8, name: 'Prince Kumar', fileNo: '101564', filingType: 'E-Filing', email: 'prince.kumar@yahoo.com', regDate: '2026-05-17 09:15:46', status: 'Scheduling Pending', statusDate: '2026-05-19 22:43:43', year: '2025' },
  { sNo: 9, name: 'Himani Uday Gadve', fileNo: '52575', filingType: 'E-Filing', email: 'himani.gadve@outlook.com', regDate: '2026-05-16 02:41:14', status: 'Scheduling Pending', statusDate: '2026-05-16 03:54:55', year: '2025' },

  // --- INFORMATION PENDING ---
  { sNo: 12, name: 'Vikram Sarabhai', fileNo: '50102', filingType: 'E-Filing', email: 'vikram.s@gmail.com', regDate: '2026-05-10 11:00:00', status: 'Information Pending', statusDate: '2026-05-12 14:20:00', year: '2025' },
  { sNo: 13, name: 'Sanjay Dutt', fileNo: '50103', filingType: 'Paper Filing', email: 'sanjay.d@yahoo.com', regDate: '2026-05-11 09:30:00', status: 'Information Pending', statusDate: '2026-05-13 10:15:00', year: '2025' },

  // --- INTERVIEW PENDING ---
  { sNo: 14, name: 'Ravi Teja', fileNo: '60104', filingType: 'E-Filing', email: 'ravi.teja@gmail.com', regDate: '2026-04-18 10:11:00', status: 'Interview Pending', statusDate: '2026-04-20 16:45:00', year: '2025' },
  { sNo: 15, name: 'Kavita Menon', fileNo: '60105', filingType: 'E-Filing', email: 'kavita.m@outlook.com', regDate: '2026-04-19 12:00:00', status: 'Interview Pending', statusDate: '2026-04-21 11:30:00', year: '2025' },

  // --- DOCUMENTS PENDING ---
  { sNo: 16, name: 'Tushar Kapoor', fileNo: '70106', filingType: 'Paper Filing', email: 'tushar.k@gmail.com', regDate: '2026-03-15 08:30:00', status: 'Documents Pending', statusDate: '2026-03-18 09:40:00', year: '2025' },
  { sNo: 17, name: 'Deepa Malik', fileNo: '70107', filingType: 'E-Filing', email: 'deepa.malik@gmail.com', regDate: '2026-03-16 14:15:00', status: 'Documents Pending', statusDate: '2026-03-19 10:20:00', year: '2025' },

  // --- PREPARATION - 1 & PREPARATION - 2 ---
  { sNo: 201, name: 'Amitabh Sharma', fileNo: '80201', filingType: 'E-Filing', email: 'amitabh.s@gmail.com', regDate: '2026-03-01 10:00:00', status: 'Preparation - 1', statusDate: '2026-03-05 11:30:00', year: '2025' },
  { sNo: 202, name: 'Neha Kakkar', fileNo: '80202', filingType: 'E-Filing', email: 'neha.k@gmail.com', regDate: '2026-03-02 11:20:00', status: 'Preparation - 1', statusDate: '2026-03-06 14:00:00', year: '2025' },
  { sNo: 203, name: 'Rohit Sharma', fileNo: '80203', filingType: 'E-Filing', email: 'rohit.45@gmail.com', regDate: '2026-03-03 09:15:00', status: 'Preparation - 2', statusDate: '2026-03-07 10:45:00', year: '2025' },
  { sNo: 204, name: 'Shreya Ghoshal', fileNo: '80204', filingType: 'Paper Filing', email: 'shreya.g@music.com', regDate: '2026-03-04 15:30:00', status: 'Preparation - 2', statusDate: '2026-03-08 12:10:00', year: '2025' },

  // --- REVIEW & SUMMARY 1 & 2 ---
  { sNo: 205, name: 'Hardik Pandya', fileNo: '80205', filingType: 'E-Filing', email: 'hardik.p@cricket.in', regDate: '2026-02-15 10:10:00', status: 'Review & Summary 1', statusDate: '2026-02-20 11:00:00', year: '2025' },
  { sNo: 206, name: 'Jasprit Bumrah', fileNo: '80206', filingType: 'E-Filing', email: 'jasprit.b@cricket.in', regDate: '2026-02-16 11:45:00', status: 'Review & Summary 2', statusDate: '2026-02-21 16:20:00', year: '2025' },

  // --- ITIN FILES & REVISED ESTIMATE ---
  { sNo: 207, name: 'Sunil Chhetri', fileNo: '80207', filingType: 'Paper Filing', email: 'sunil.c@soccer.in', regDate: '2026-02-01 08:20:00', status: 'ITIN Files', statusDate: '2026-02-05 09:30:00', year: '2025' },
  { sNo: 208, name: 'Sania Mirza', fileNo: '80208', filingType: 'E-Filing', email: 'sania.m@tennis.org', regDate: '2026-02-02 14:10:00', status: 'Revised Estimate', statusDate: '2026-02-06 15:40:00', year: '2025' },

  // --- PAYMENT PENDING - EFILING ---
  { sNo: 101, name: 'Maitryi Das', fileNo: '100017', filingType: 'E-Filing', email: 'maitryi.das@gmail.com', regDate: '2025-12-28 01:33:59', status: 'Payment Pending - Efiling', statusDate: '2026-06-20 03:57:34', year: '2025' },
  { sNo: 102, name: 'Shashank Yelagandula', fileNo: '80921', filingType: 'Paper Filing', email: 'shashank.y@gmail.com', regDate: '2026-01-19 02:45:45', status: 'Payment Pending - Efiling', statusDate: '2026-06-19 01:02:57', year: '2025' },
  { sNo: 103, name: 'Bipin Kumar Dwivedi', fileNo: '100027', filingType: 'Paper Filing', email: 'bipin.dwivedi@gmail.com', regDate: '2025-12-30 05:18:26', status: 'Payment Pending - Efiling', statusDate: '2026-06-17 21:36:20', year: '2025' },
  { sNo: 104, name: 'Saikrishna Bobba', fileNo: '42023', filingType: 'E-Filing', email: 'saikrishna.bobba@gmail.com', regDate: '2026-03-12 00:51:43', status: 'Payment Pending - Efiling', statusDate: '2026-06-16 21:32:23', year: '2025' },

  // --- PAYMENT PENDING - PAPER FILING ---
  { sNo: 301, name: 'Vishnuvardhan Janapati', fileNo: '101376', filingType: 'E-Filing', email: 'vishnu.janapati@gmail.com', regDate: '2026-04-07 13:24:28', status: 'Payment Pending - Paper filing', statusDate: '2026-04-16 00:45:02', year: '2025' },
  { sNo: 302, name: 'Sandeep Malik', fileNo: '101192', filingType: 'Paper Filing', email: 'sandeep.malik@outlook.com', regDate: '2026-03-30 00:50:14', status: 'Payment Pending - Paper filing', statusDate: '2026-04-15 21:43:22', year: '2025' },

  // --- FEE PAYMENT RECEIVED I & II ---
  { sNo: 303, name: 'Raj Kamal', fileNo: '10047', filingType: 'E-Filing', email: 'raj.kamal@gmail.com', regDate: '2025-12-22 23:51:16', status: 'Fee Payment Received - II', statusDate: '2026-06-20 00:16:30', year: '2025' },
  { sNo: 304, name: 'Sandeep Bodigalla', fileNo: '41798', filingType: 'E-Filing', email: 'sandeep.bodigalla@yahoo.com', regDate: '2026-01-26 19:58:52', status: 'Fee Payment Received - II', statusDate: '2026-06-20 00:14:27', year: '2025' },
  { sNo: 305, name: 'Anil Kumble', fileNo: '10048', filingType: 'E-Filing', email: 'anil.k@cricket.org', regDate: '2025-12-23 10:00:00', status: 'Fee Payment Received - I', statusDate: '2026-06-18 12:00:00', year: '2025' },

  // --- CLIENT REVIEW ---
  { sNo: 401, name: 'Priya Sharma', fileNo: '101580', filingType: 'E-Filing', email: 'priya.sharma@gmail.com', regDate: '2026-02-11 08:22:14', status: 'Client Review - Efiling', statusDate: '2026-06-20 09:15:00', year: '2025' },
  { sNo: 402, name: 'Rajan Mehta', fileNo: '91502', filingType: 'E-Filing', email: 'rajan.mehta@outlook.com', regDate: '2026-01-28 14:33:50', status: 'Client Review - Efiling', statusDate: '2026-06-20 08:47:22', year: '2025' },
  { sNo: 403, name: 'Dhruv Chauhan', fileNo: '100295', filingType: 'Paper Filing', email: 'dhruv.chauhan@gmail.com', regDate: '2026-02-10 11:30:00', status: 'Client Review - Paper Filing', statusDate: '2026-06-19 15:42:00', year: '2025' },

  // --- E-FILING STATUSES ---
  { sNo: 501, name: 'Arun Kumar', fileNo: '20530', filingType: 'E-Filing', email: 'arunkumar@tech.net', regDate: '2026-05-23 12:24:55', status: 'E-Filing Accepted & Filing Complete', statusDate: '2026-06-03 02:34:25', year: '2025' },
  { sNo: 502, name: 'Baishampayan Roy', fileNo: '101563', filingType: 'E-Filing', email: 'baishampayan.roy@gmail.com', regDate: '2026-05-13 21:14:57', status: 'E-Filing Accepted & Filing Complete', statusDate: '2026-06-02 02:21:05', year: '2025' },
  { sNo: 503, name: 'Kiran Kumar', fileNo: '20531', filingType: 'E-Filing', email: 'kiran.k@tech.net', regDate: '2026-04-10 09:00:00', status: 'Efiling Pending - 1', statusDate: '2026-04-12 10:00:00', year: '2025' },
  { sNo: 504, name: 'Varun Dhawan', fileNo: '20532', filingType: 'E-Filing', email: 'varun.d@cinema.com', regDate: '2026-04-11 11:30:00', status: 'Efiling Pending - 2', statusDate: '2026-04-13 14:10:00', year: '2025' },
  { sNo: 505, name: 'Siddharth Malhotra', fileNo: '20533', filingType: 'E-Filing', email: 'sid.m@cinema.com', regDate: '2026-04-12 15:20:00', status: 'E - Filed & Awaiting Acceptance - 1', statusDate: '2026-04-14 16:30:00', year: '2025' },
  { sNo: 506, name: 'Kiara Advani', fileNo: '20534', filingType: 'E-Filing', email: 'kiara.a@cinema.com', regDate: '2026-04-13 16:45:00', status: 'E - Filed & Awaiting Acceptance - 2', statusDate: '2026-04-15 17:00:00', year: '2025' },
  { sNo: 507, name: 'Ranbir Kapoor', fileNo: '20535', filingType: 'E-Filing', email: 'ranbir.k@films.com', regDate: '2026-04-14 10:00:00', status: 'E - Filed & Rejected', statusDate: '2026-04-16 11:30:00', year: '2025' },
  { sNo: 508, name: 'Alia Bhatt', fileNo: '20536', filingType: 'E-Filing', email: 'alia.b@films.com', regDate: '2026-04-15 12:15:00', status: 'City Return', statusDate: '2026-04-17 14:00:00', year: '2025' },

  // --- PAPER FILING STATUSES ---
  { sNo: 601, name: 'Shah Rukh Khan', fileNo: '30501', filingType: 'Paper Filing', email: 'srk@redchillies.in', regDate: '2026-03-10 10:00:00', status: 'Paper Filing Pending', statusDate: '2026-03-12 11:00:00', year: '2025' },
  { sNo: 602, name: 'Gauri Khan', fileNo: '30502', filingType: 'Paper Filing', email: 'gauri.k@design.in', regDate: '2026-03-11 11:30:00', status: 'Paper Filing Done', statusDate: '2026-03-15 15:00:00', year: '2025' },

  // --- PRIOR TAX YEARS SAMPLE (TY2024, TY2023) ---
  { sNo: 1001, name: 'John Doe', fileNo: '99001', filingType: 'E-Filing', email: 'john.doe@gmail.com', regDate: '2025-05-10 10:00:00', status: 'Scheduling Pending', statusDate: '2025-05-12 11:00:00', year: '2024' },
  { sNo: 1002, name: 'Jane Smith', fileNo: '99002', filingType: 'Paper Filing', email: 'jane.smith@gmail.com', regDate: '2025-04-12 09:15:00', status: 'Scheduling Pending', statusDate: '2025-04-15 10:00:00', year: '2024' },
  { sNo: 1003, name: 'Alice Johnson', fileNo: '99003', filingType: 'E-Filing', email: 'alice.j@gmail.com', regDate: '2024-06-01 14:20:00', status: 'Scheduling Pending', statusDate: '2024-06-05 16:30:00', year: '2023' }
];

export const INITIAL_COMMENTS = {
  1: [
    { status: 'Scheduling Pending', comments: 'vm sent - pallavi', dateTime: '06-15-2026 :: 23:26' },
    { status: 'Scheduling Pending', comments: 'vm sent - pallavi', dateTime: '06-11-2026 :: 22:50' },
    { status: 'Scheduling Pending', comments: 'call not answered - Nagasri', dateTime: '06-05-2026 :: 21:25' }
  ]
};

export const getMemberDetails = (member) => {
  if (!member) return null;
  const nameParts = member.name.split(' ');
  const fName = nameParts[0] || 'User';
  const lName = nameParts[nameParts.length - 1] || 'Member';

  if (member.sNo === 1) {
    return {
      personal: {
        firstName: 'AMARDEEP',
        middleName: '',
        lastName: 'KUMAR',
        contactNumber: '8739732888',
        alternateNumber: '8739732888',
        timeZone: 'PST',
        ssn: '188-71-7012',
        dob: '01-05-1986',
        employer: 'TECH CORP',
        gender: 'MALE',
        occupation: 'IT ENGINEER',
        visaType: 'H1B',
        email: 'amardeep.k@gmail.com',
        address: '36163 FREMONT BLVD APT 10',
        city: 'FREMONT',
        state: 'CA',
        zipcode: '94536',
        filingStatus: 'MARRIED FILING JOINT',
        filingType: member.filingType,
        firstEntry: '01-26-2014',
        marriageDate: '11-19-2013',
        referred: 'YES',
        referredName: 'Rajesh',
        referredEmail: 'rajesh@gmail.com',
        updatedAt: '2026-01-27 22:41:04'
      },
      spouse: {
        firstName: 'ANSHU',
        middleName: 'KUMARI',
        lastName: 'BARANWAL',
        ssn: '949-96-1255',
        dob: '12-02-1990',
        occupation: 'HOUSEWIFE',
        visaType: 'H4',
        taxIdType: 'SSN OR ITIN',
        passportNumber: 'Z1234567',
        passportExpiry: '10-10-2029',
        visaNumber: 'V9876543',
        visaExpiry: '12-31-2028',
        usaEntry: '05-10-2014',
        updatedAt: '2026-01-27 22:42:42'
      },
      dependents: [
        { name: 'DISHA BARANWAL', ssn: '714-31-3458', relationship: 'DAUGHTER', dob: '03-17-2024', visa: 'USCITIZEN', updated: '2024-11-04 07:59:26' },
        { name: 'VIVAAN BARANWAL', ssn: '968-98-7445', relationship: 'SON', dob: '10-05-2017', visa: 'H4', updated: '2019-01-27 22:48:41' }
      ],
      bank: {
        bankName: 'JPMorgan Chase Bank',
        accountNumber: '909999713',
        routingNumber: '322271627',
        accountType: 'Checking Account',
        updatedAt: '2026-02-23 00:34:27'
      }
    };
  }

  return {
    personal: {
      firstName: fName.toUpperCase(),
      middleName: '',
      lastName: lName.toUpperCase(),
      contactNumber: '9876543210',
      alternateNumber: '9876543210',
      timeZone: 'EST',
      ssn: `999-00-${member.fileNo ? member.fileNo.substring(0, 4) : '1000'}`,
      dob: '08-15-1990',
      employer: 'GLOBAL SOLUTIONS',
      gender: 'MALE',
      occupation: 'SOFTWARE DEVELOPER',
      visaType: 'H1B',
      email: member.email,
      address: '100 Main St Apt 2C',
      city: 'Jersey City',
      state: 'NJ',
      zipcode: '07302',
      filingStatus: 'SINGLE',
      filingType: member.filingType,
      firstEntry: '08-12-2018',
      marriageDate: '',
      referred: 'NO',
      referredName: '',
      referredEmail: '',
      updatedAt: member.regDate
    },
    spouse: {
      firstName: '',
      middleName: '',
      lastName: '',
      ssn: '',
      dob: '',
      occupation: '',
      visaType: '',
      taxIdType: '',
      passportNumber: '',
      passportExpiry: '',
      visaNumber: '',
      visaExpiry: '',
      usaEntry: '',
      updatedAt: ''
    },
    dependents: [],
    bank: {
      bankName: 'Bank of America',
      accountNumber: '1029384756',
      routingNumber: '021000021',
      accountType: 'Checking Account',
      updatedAt: member.regDate
    }
  };
};

export const WORKFLOW_STATUSES = [
  'Registered Users',
  'Basic Information Pending',
  'Scheduling Pending',
  'Interview Pending',
  'Documents Pending',
  'Preparation - 1',
  'Preparation - 2',
  'Review & Summary 1',
  'Review & Summary 2',
  'ITIN Files',
  'Revised Estimate',
  'Payment Pending - Efiling',
  'Payment Pending - Paper filing',
  'Fee Payment Received - I',
  'Fee Payment Received - II',
  'Client Review - Efiling',
  'Client Review - Paper Filing',
  'Efiling Pending - 1',
  'Efiling Pending - 2',
  'E - Filed & Awaiting Acceptance - 1',
  'E - Filed & Awaiting Acceptance - 2',
  'E - Filed & Rejected',
  'City Return',
  'E-Filing Accepted & Filing Complete',
  'Paper Filing Pending',
  'Paper Filing Done',
  'Cancelled'
];
