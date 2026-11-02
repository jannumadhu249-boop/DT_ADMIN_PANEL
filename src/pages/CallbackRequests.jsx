import React, { useState } from 'react';
import { formatDate } from '../utils/dateUtils';

export default function CallbackRequests() {
  const [searchEmail, setSearchEmail] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data based on the screenshot
  const initialRequests = [
    {
      sNo: 1,
      name: 'Vikram Bojjam',
      email: 'vbojjam@gmail.com',
      mobile: '(714) 376-5730',
      comments: 'Hi,Are you still doing taxes. Tried to log in with OTP but it is not allowing me.',
      dateCreated: '2026-06-09 20:21:41'
    },
    {
      sNo: 2,
      name: 'Moulya Gopalaiah',
      email: 'moulya.gopalaiah@outlook.com',
      mobile: '5513283491',
      comments: 'Hi,\n\nI am looking to create a LLC. Need some professional help.\n\nThank you,\nMoulya',
      dateCreated: '2026-06-05 13:03:30'
    },
    {
      sNo: 3,
      name: 'Dipali',
      email: 'dipali.malkedia@yahoo.com',
      mobile: '5828258686',
      comments: "I have called 2-3 times sometimes people do not answer and sometimes my call never picked up. I was forgot to file 1042-S. So requested ammand. But no one updated me whether my ammend was filed or not. And also I haven't received amount for ammend. So regarding that I was trying hard to call but sometimes my call didn't picked and sometimes people say I will check and call back u in few mins and they never call me. This service is not expected",
      dateCreated: '2026-05-27 19:48:41'
    },
    {
      sNo: 4,
      name: 'Kavan Bhatt',
      email: 'kavan.bhatt@outlook.com',
      mobile: '4083986193',
      comments: "Haven't received my state tax returns, need an update",
      dateCreated: '2026-05-20 15:05:49'
    },
    {
      sNo: 5,
      name: 'ANURAG SINGH',
      email: 'Anurag19922005@gmail.com',
      mobile: '6092385329',
      comments: 'delinquent FBAR filing.',
      dateCreated: '2026-05-20 10:42:49'
    },
    {
      sNo: 6,
      name: 'SUSAN J STUSKA',
      email: 'susan@brentautomations.com',
      mobile: '2252206791',
      comments: 'Hello,\n\nI hope you are doing well. I came across your firm on the AICPA website and wanted to reach out to inquire whether you are currently accepting new clients for tax preparation services.\n\nMy husband and I were recently married, and this will be our first time filing jointly. My return is fairly straightforward, but my husband has multiple sources of income, so we would like to work with a professional to ensure everything is filed properly and to help us navigate the process together for the first time.\n\nIf you are available to take on new clients, please let me know a convenient time for me to call or stop by your office so we can get everything set up.\n\nThank you for your time and consideration. I look forward to hearing from you soon.',
      dateCreated: '2026-05-14 22:47:57'
    },
    {
      sNo: 7,
      name: 'QPbmCRVM',
      email: 'testing@example.com',
      mobile: '987-65-4321',
      comments: '20',
      dateCreated: '2026-05-08 15:57:27'
    },
    {
      sNo: 8,
      name: 'Vishnu vardhan reddy Patu',
      email: 'poluvureddy@gmail.com',
      mobile: '3025100068',
      comments: 'Can someone please call me on my tax status.',
      dateCreated: '2026-04-23 14:35:13'
    },
    {
      sNo: 9,
      name: 'Dharani Neela',
      email: 'dneela131@gmail.com',
      mobile: '+1 8576935505',
      comments: 'I am an F-1 Student from India. I want to file my W-2 and 1042-S Taxes for Federal and State. I want to know the pricing.',
      dateCreated: '2026-04-21 08:32:37'
    },
    {
      sNo: 10,
      name: 'Ray Landon',
      email: 'ray.landon@proonlineprofiles.com',
      mobile: '8149805065',
      comments: 'Wikipedia is considered to be the World\'s most significant tool for reference material. The Wiki links show up on the 1st page of Google 97% of the time. With a Page on one of the most revered reference tools, you are sure to get yourself or your business noticed. So if you\'re thinking of getting a Wikipedia Page created, it\'s the best time of the year.\n\nIf you are interested in getting more information just respond back to this email.\n\nThanks,\n\nRay Landon\nSales Executive\nPro Online Profiles\nray.landon@proonlineprofiles.com\n\nReply STOP to opt out.',
      dateCreated: '2026-04-17 12:43:41'
    },
    {
      sNo: 11,
      name: 'Thrushanth',
      email: 'thrushanth@gmail.com',
      mobile: '6894551215',
      comments: 'Hi Sasidhar Reddy (sasi.chakri@gmail.com) has referred your site for tax filing can you please help',
      dateCreated: '2026-04-14 15:28:57'
    },
    {
      sNo: 12,
      name: 'Vidisha',
      email: 'vidisha317@gmail.com',
      mobile: '8012581542',
      comments: 'Please call me on whatsapp number 8012581542. Since I am in India right now',
      dateCreated: '2026-04-13 05:27:53'
    },
    {
      sNo: 13,
      name: 'Kaustubh K Srivastava',
      email: 'kaustubh.srivastava@gmail.com',
      mobile: '+18474545259',
      comments: 'I got your reference from a friend. Can you please call me @+1-847-454-5259.',
      dateCreated: '2026-04-10 23:23:54'
    },
    {
      sNo: 14,
      name: 'Tanvi Jain',
      email: 'jaintanvi1510@gmail.com',
      mobile: '4155188247',
      comments: 'I wanted to file joint filing (married) for taxes... Can you give me a quotation?',
      dateCreated: '2026-04-09 22:07:19'
    },
    {
      sNo: 15,
      name: 'Megh Patel',
      email: 'megh8452@gmail.com',
      mobile: '635-254-2267',
      comments: 'I have filed my taxes through turbotax as a resident, but I\'m a non-resident (F1). I need help for making corrections.',
      dateCreated: '2026-04-09 13:21:34'
    },
    {
      sNo: 16,
      name: 'Sarthak Anand',
      email: 'anandsarthak57@gmail.com',
      mobile: '2244201491',
      comments: 'Can you call me today',
      dateCreated: '2026-04-04 16:03:10'
    },
    {
      sNo: 17,
      name: 'Vaibhavi Katiyar',
      email: 'vaibhavi.katiyar@capitalone.com',
      mobile: '3126849510',
      comments: 'Hi,\n\nI need to file taxes by 15th April 2025. Looking for someone who can file my taxes. Please let me know when we can discuss further and what all information you might need from me.',
      dateCreated: '2026-04-03 18:37:50'
    },
    {
      sNo: 18,
      name: 'Shreya Reddy Kothireddy',
      email: 'shreyak1602@gmail.com',
      mobile: '5089717588',
      comments: 'I would like to get a free quote and let me know the price for filing the taxes with you.',
      dateCreated: '2026-04-03 01:55:18'
    },
    {
      sNo: 19,
      name: 'Sophie Lane',
      email: 'sophie@sendproud.com',
      mobile: '2156394452',
      comments: 'Hi, I\'m Sophie! I tried to find you on LinkedIn but couldn\'t, so I\'m reaching out here. I help businesses book meetings, drive traffic, and generate user sign ups through targeted outreach using my extensive private network... Schedule a time with me here: https://calendly.com/sendproud/30min',
      dateCreated: '2026-04-01 20:11:47'
    },
    {
      sNo: 20,
      name: 'Arjun Patel',
      email: 'simbapatel37@gmail.com',
      mobile: '8624316858',
      comments: 'I would like to file my individual tax with your company.',
      dateCreated: '2026-04-01 16:50:26'
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilterQuery(searchEmail.trim());
    setCurrentPage(1);
  };

  const filteredRequests = initialRequests.filter((req) => {
    if (!filterQuery) return true;
    return req.email.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <div className="content-card" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="header-section" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--text-dark)' }}>Callback Requests</h2>
      </div>

      {/* Search Bar matching screenshot */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>Email</label>
          <input
            type="text"
            className="search-input-box"
            placeholder="Search by Email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{ width: '220px' }}
          />
        </div>
        <button
          type="submit"
          className="btn"
          style={{
            backgroundColor: '#1b62a5',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer'
          }}
        >
          Submit
        </button>
        {filterQuery && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setSearchEmail('');
              setFilterQuery('');
            }}
            style={{
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Table Section */}
      <div className="table-responsive">
        <table className="corporate-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>S.No</th>
              <th style={{ width: '150px' }}>Name</th>
              <th style={{ width: '180px' }}>Email</th>
              <th style={{ width: '130px' }}>Mobile</th>
              <th>Comments</th>
              <th style={{ width: '150px' }}>Date Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req, idx) => (
                <tr key={req.sNo}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: '500' }}>{req.name}</td>
                  <td>
                    <a href={`mailto:${req.email}`} style={{ color: '#0076a3', textDecoration: 'none' }}>
                      {req.email}
                    </a>
                  </td>
                  <td>{req.mobile}</td>
                  <td style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{req.comments}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{req.dateCreated ? formatDate(req.dateCreated) : '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No callback requests found matching the search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <div className="pagination-row">
          <button className={`page-link-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
          <button className={`page-link-btn ${currentPage === 2 ? 'active' : ''}`} onClick={() => setCurrentPage(2)}>2</button>
          <button className={`page-link-btn ${currentPage === 3 ? 'active' : ''}`} onClick={() => setCurrentPage(3)}>3</button>
          <button className="page-link-btn">&gt;</button>
          <button className="page-link-btn">Last</button>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Showing 1 to {filteredRequests.length} of {filteredRequests.length} entries
        </div>
      </div>
    </div>
  );
}
