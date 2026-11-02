// const base_url = "http://187.127.143.141:4000/"

const base_url = "http://72.61.116.4:8000/"

export const URLS = {

    Base : base_url ,
    ImageUrl : base_url,
    DashboardImageUrl : base_url + "uploads/dashboard/",


    // Authentication
    Login : base_url + "v1/dollarTax/admin/auth/login",
    LoginVerification : base_url + "v1/dollarTax/admin/auth/verifyLoginOtp",
    ChangePassword : base_url + "v1/dollarTax/admin/auth/change-password",
    GetProfile : base_url + "v1/dollarTax/admin/auth/getProfile",

    // Forgot Password
    GenerateOtp : base_url + "v1/dollarTax/admin/auth/generateForgotPasswordOtp",
    VerifyOtp : base_url + "v1/dollarTax/admin/auth/verifyForgotPasswordOtp",
    ResetPassword : base_url + "v1/dollarTax/admin/auth/resetPassword",


    // Years
    GetYears : base_url + "v1/dollarTax/admin/years/getYears",
    GetCurrentYear : base_url + "v1/dollarTax/admin/years/getCurrentYear",
    GetLatestFiveYears : base_url + "v1/dollarTax/admin/years/getRecentFiveYears",

    // All Registred
    GetAllRegistred : base_url + "v1/dollarTax/admin/registeredMembers/getRegisteredMembers",
    SendEmailOtp : base_url + "v1/dollarTax/admin/registeredMembers/sendViewEmailOtp",
    VerifyEmailOtp : base_url + "v1/dollarTax/admin/registeredMembers/verifyViewEmailOtp",
    SendContactOtp : base_url + "v1/dollarTax/admin/registeredMembers/sendViewContactOtp",
    VerifyContactOtp : base_url + "v1/dollarTax/admin/registeredMembers/verifyViewContactOtp",
    ExportCurrentYear : base_url + "v1/dollarTax/admin/registeredMembers/exportCurrentYearMembers",
    ExportPerivousYear : base_url + "v1/dollarTax/admin/registeredMembers/exportPreviousMembers",

    // Member View
    GetMemberView : base_url + "v1/dollarTax/admin/memberView/member/",
    SendContactOtp : base_url + "v1/dollarTax/admin/registeredMembers/sendViewContactOtp",
    VerifyContactOtp : base_url + "v1/dollarTax/admin/registeredMembers/verifyViewContactOtp",

    // Bank Details
    CreateBankDetails : base_url + "v1/dollarTax/admin/memberBank/addBankDetails/",
    UpdateBankDetails : base_url + "v1/dollarTax/admin/memberBank/updateBankDetails/",

    // Upload Documents
    GetUploadList : base_url + "v1/dollarTax/admin/adminUpload/getUploadedDocuments/",
    UploadDocuments : base_url + "v1/dollarTax/admin/adminUpload/uploadDocByAdmin/",
    DeleteUploads : base_url + "v1/dollarTax/admin/adminUpload/deleteUploadedDocument/",

    // File Info
    GetFileInfo : base_url + "v1/dollarTax/admin/memberStatus/getMemberStatusHistory/",
    CreateFileInfo : base_url + "v1/dollarTax/admin/memberStatus/createMemberStatus/",

    // Pay
    GetPayList : base_url + "v1/dollarTax/admin/pay/getPaymentHistory/",
    PayAmount : base_url + "v1/dollarTax/admin/pay/addPayment/",

    // Referrals
    GetReferalReport : base_url + "v1/dollarTax/admin/referrals/getReferralsReport",
    ViewReferalMember : base_url + "v1/dollarTax/admin/referrals/getReferralReportByMember/",
    RefereeSendEmailOtp : base_url + "v1/dollarTax/admin/referrals/sendReferralEmailOtp",
    RefereeVerifyEmailOtp : base_url + "v1/dollarTax/admin/referrals/verifyReferralEmailOtp",

    // Referee
    GetRefereeReport : base_url + "v1/dollarTax/admin/referrals/getRefereeReport",
    ExportRefereeReport : base_url + "v1/dollarTax/admin/referrals/exportRefereeReport",
    UpdateRefereeReport : base_url + "v1/dollarTax/admin/referrals/updateRefereeReport/",

    // Client Search 
    GetClientSearch : base_url + "v1/dollarTax/admin/clientSearch/getClientSearch",

    // Query List
    GetQueryList : base_url + "v1/dollarTax/admin/queryList/getAllQueries",
    ReplyQuery : base_url + "v1/dollarTax/admin/queryList/replyQuery/",

    // Client Stage
    GetClientStage : base_url + "v1/dollarTax/admin/stage/getMemberStages",

    // Dashboard Content
    GetDashboardContent    : base_url + "v1/dollarTax/admin/dashboardContent/getDashboardContents",
    CreateDashboardContent : base_url + "v1/dollarTax/admin/dashboardContent/addDashboardContent",
    GetByIdDashboardContent : base_url + "v1/dollarTax/admin/dashboardContent/getDashboardContentById/",
    UpdateDashboardContent : base_url + "v1/dollarTax/admin/dashboardContent/updateDashboardContent/",
    DeleteDashboardContent : base_url + "v1/dollarTax/admin/dashboardContent/deleteDashboardContent/",

    // Role Access
    GetRoles    : base_url + "v1/dollarTax/admin/role/getRoles",
    GetActiveRoles : base_url + "v1/dollarTax/admin/role/getActiveRoles",
    CreateRole  : base_url + "v1/dollarTax/admin/role/addRole",
    GetByIdRole : base_url + "v1/dollarTax/admin/role/getRoleById/",
    UpdateRole  : base_url + "v1/dollarTax/admin/role/updateRole/",
    DeleteRole  : base_url + "v1/dollarTax/admin/role/deleteRole/",

    // Staff
    GetStaff    : base_url + "v1/dollarTax/admin/staff/getStaff",
    CreateStaff : base_url + "v1/dollarTax/admin/staff/addStaff",
    GetByIdStaff : base_url + "v1/dollarTax/admin/staff/getStaffById/",
    UpdateStaff : base_url + "v1/dollarTax/admin/staff/updateStaff/",
    DeleteStaff : base_url + "v1/dollarTax/admin/staff/deleteStaff/",

    // Leads
    GetLeads     : base_url + "v1/dollarTax/admin/leads/getLeads",
    AddLead      : base_url + "v1/dollarTax/admin/leads/addLead",
    GetLeadById  : base_url + "v1/dollarTax/admin/leads/getLeadById/",
    UpdateLead   : base_url + "v1/dollarTax/admin/leads/updateLead/",

    // Leads Follow Up
    GetFollowUpLead : base_url + "v1/dollarTax/admin/followUp/getLeadFollowUps/",
    CreateFollowUpLead : base_url + "v1/dollarTax/admin/followUp/addFollowup/",
    UpdateFollowUpLead : base_url + "v1/dollarTax/admin/followUp/updateFollowup/",

    // Notes
    GetNotes : base_url + "v1/dollarTax/admin/notes/getNotes",
    CreateNotes : base_url + "v1/dollarTax/admin/notes/addNote",
    GetByIdNotes : base_url + "v1/dollarTax/admin/notes/getNoteById/",
    UpdateNotes : base_url + "v1/dollarTax/admin/notes/updateNote/",
    DeleteNotes : base_url + "v1/dollarTax/admin/notes/deleteNote/",

    // Just Uploaded Docs
    GetJustUploadDocs : base_url + "v1/dollarTax/admin/justUploadedDocs/getAllUploadedDocuments",
    ViewJustUploadDocs : base_url + "v1/dollarTax/admin/memberView/member/",
    MarkDocumentViewed : base_url + "v1/dollarTax/admin/justUploadedDocs/markDocumentViewed",

    //Query Messages
    GetQueryMessages : base_url + "v1/dollarTax/admin/dashboard/getDashboardMessages",

    //Send Mail
    SendMail : base_url + "v1/dollarTax/admin/customMail/sendMail",
    TestMail : base_url + "v1/dollarTax/admin/customMail/testMail",

    //Mail Gun
    SendMailGun : base_url + "v1/dollarTax/admin/excelMail/sendExcelMail",

    //Fbar Questionnaier
    GetFbarQuestionnaier : base_url + "v1/dollarTax/admin/document/getAll/fbar",
    UploadFbarQuestionnaier : base_url + "v1/dollarTax/admin/document/fbar/upload",
    GetByIdFbar : base_url + "v1/dollarTax/admin/document/single/fbar/",
    // Shared document binary stream (same docs users download by document id)
    ViewFbarDocument : base_url + "v1/dollarTax/user/document/download/fbar/",
    DeleteFbarQuestionnaier : base_url + "v1/dollarTax/admin/document/delete/",

    //Tax Organizer
    GetTaxOrganizer : base_url + "v1/dollarTax/admin/document/getAll/tax-organizer",
    UploadTaxOrganizer : base_url + "v1/dollarTax/admin/document/upload",
    GetByIdTaxOrganizer : base_url + "v1/dollarTax/admin/document/single/tax-organizer/",
    ViewTaxOrganizerDocument : base_url + "v1/dollarTax/user/document/download/tax-organizer/",
    DeleteTaxOrganizer : base_url + "v1/dollarTax/admin/document/delete/",

}