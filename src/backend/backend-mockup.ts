import type {
  AdminPermissionResponse,
  AttachedFileResponse,
  BannerResponse,
  BlindPostResponse,
  BoardMemberStatsResponse,
  BoardPostResponse,
  CommentMemberResponse,
  CommentResponse,
  EditorUploadResponse,
  EventBoardDetailsResponse,
  EventBoardSummaryResponse,
  ExpenseReportResponse,
  HospitalResponse,
  MemberDetailsResponse,
  MemberResponse,
  PartnerContractDetailsResponse,
  PartnerResponse,
  PerformanceStatsResponse,
  PrescriptionPartnerProductResponse,
  PrescriptionPartnerResponse,
  PrescriptionResponse,
  ProductBriefingMultiDetailResponse,
  ProductBriefingSingleDetailResponse,
  ProductDetailsResponse,
  ProductSummaryResponse,
  SalesAgencyProductApplicantResponse,
  SalesAgencyProductDetailsResponse,
  SalesAgencyProductSummaryResponse,
  SampleProvideReportDetailResponse,
  SettlementPartnerProductResponse,
  SettlementPartnerResponse,
  SettlementResponse,
} from './backend';
import {
  applyContract as originalApplyContract,
  applyProduct as originalApplyProduct,
  approveContract as originalApproveContract,
  approveOrRejectCso as originalApproveOrRejectCso,
  changePassword as originalChangePassword,
  completePrescriptionPartner as originalCompletePrescriptionPartner,
  confirmPrescription as originalConfirmPrescription,
  createBanner as originalCreateBanner,
  createBoardPost as originalCreateBoardPost,
  createComment as originalCreateComment,
  createEventBoard as originalCreateEventBoard,
  createPartner as originalCreatePartner,
  createPartnerProducts as originalCreatePartnerProducts,
  createProductBriefingMultiReport as originalCreateProductBriefingMultiReport,
  createProductBriefingSingleReport as originalCreateProductBriefingSingleReport,
  createProductExtraInfo as originalCreateProductExtraInfo,
  createReport as originalCreateReport,
  createSalesAgencyProductBoard as originalCreateSalesAgencyProductBoard,
  createSampleProvideReport as originalCreateSampleProvideReport,
  deleteBoardPost as originalDeleteBoardPost,
  deleteComment as originalDeleteComment,
  deleteMember as originalDeleteMember,
  deletePartner as originalDeletePartner,
  deletePrescriptionPartner as originalDeletePrescriptionPartner,
  downloadExpenseReportListExcel as originalDownloadExpenseReportListExcel,
  downloadPerformanceExcel as originalDownloadPerformanceExcel,
  downloadProductApplicantsExcel as originalDownloadProductApplicantsExcel,
  downloadProductSummariesExcel as originalDownloadProductSummariesExcel,
  downloadSalesAgencyProductsExcel as originalDownloadSalesAgencyProductsExcel,
  downloadSettlementListExcel as originalDownloadSettlementListExcel,
  downloadSettlementPartnerSummaryExcel as originalDownloadSettlementPartnerSummaryExcel,
  downloadUserMembersExcel as originalDownloadUserMembersExcel,
  downloadZippedEdiFiles as originalDownloadZippedEdiFiles,
  exportAll as originalExportAll,
  getAdminMembers as originalGetAdminMembers,
  getAttachedEdiFiles as originalGetAttachedEdiFiles,
  getBanner as originalGetBanner,
  getBanners as originalGetBanners,
  getBlindPosts as originalGetBlindPosts,
  getBoardDetails as originalGetBoardDetails,
  getBoardMembers as originalGetBoardMembers,
  getBoards as originalGetBoards,
  getCommentMembers as originalGetCommentMembers,
  getContractDetails as originalGetContractDetails,
  getDrugCompanies as originalGetDrugCompanies,
  getEventBoardDetails as originalGetEventBoardDetails,
  getEventBoards as originalGetEventBoards,
  getExpenseReportList as originalGetExpenseReportList,
  getHospitals as originalGetHospitals,
  getLatestPrivacyPolicy as originalGetLatestPrivacyPolicy,
  getLatestTerms as originalGetLatestTerms,
  getMemberDetails as originalGetMemberDetails,
  getPartnerDetails as originalGetPartnerDetails,
  getPartnerProducts as originalGetPartnerProducts,
  getPartners as originalGetPartners,
  getPerformanceStats as originalGetPerformanceStats,
  getPermissions as originalGetPermissions,
  getPrescriptionPartner as originalGetPrescriptionPartner,
  getPrescriptionPartnerList as originalGetPrescriptionPartnerList,
  getPrivacyPolicyByVersion as originalGetPrivacyPolicyByVersion,
  getProductApplicants as originalGetProductApplicants,
  getProductBriefingMultiReport as originalGetProductBriefingMultiReport,
  getProductBriefingSingleReport as originalGetProductBriefingSingleReport,
  getProductDetails as originalGetProductDetails,
  getProductSummaries as originalGetProductSummaries,
  getPublicKey as originalGetPublicKey,
  getSalesAgencyProductDetails as originalGetSalesAgencyProductDetails,
  getSalesAgencyProducts as originalGetSalesAgencyProducts,
  getSampleProvideReport as originalGetSampleProvideReport,
  getSettlementPartnerProducts as originalGetSettlementPartnerProducts,
  getSettlementPartnerSummary as originalGetSettlementPartnerSummary,
  getSettlements as originalGetSettlements,
  getTermsByVersion as originalGetTermsByVersion,
  getUserMembers as originalGetUserMembers,
  isAvailableNickname as originalIsAvailableNickname,
  isUserIdAvailable as originalIsUserIdAvailable,
  login as originalLogin,
  refreshToken as originalRefreshToken,
  registerFcmToken as originalRegisterFcmToken,
  rejectContract as originalRejectContract,
  searchPrescriptions as originalSearchPrescriptions,
  sendVerificationCode as originalSendVerificationCode,
  signup as originalSignup,
  signupByAdmin as originalSignupByAdmin,
  softDeleteEventBoard as originalSoftDeleteEventBoard,
  softDeleteHospital as originalSoftDeleteHospital,
  testEmail as originalTestEmail,
  testPush as originalTestPush,
  toggleBlindStatus as originalToggleBlindStatus,
  toggleBlindStatus_1 as originalToggleBlindStatus1,
  toggleLike as originalToggleLike,
  toggleLike_1 as originalToggleLike1,
  unblindPost as originalUnblindPost,
  updateApplicantNotes as originalUpdateApplicantNotes,
  updateBanner as originalUpdateBanner,
  updateBoardPost as originalUpdateBoardPost,
  updateByAdmin as originalUpdateByAdmin,
  updateComment as originalUpdateComment,
  updateContract as originalUpdateContract,
  updateEventBoard as originalUpdateEventBoard,
  updateMember as originalUpdateMember,
  updateNickname as originalUpdateNickname,
  updatePartner as originalUpdatePartner,
  updateProductBriefingMultiReport as originalUpdateProductBriefingMultiReport,
  updateProductBriefingSingleReport as originalUpdateProductBriefingSingleReport,
  updateProductExtraInfo as originalUpdateProductExtraInfo,
  updateProductExtraInfo_1 as originalUpdateProductExtraInfo1,
  updateSalesAgencyProductBoard as originalUpdateSalesAgencyProductBoard,
  updateSampleProvideReport as originalUpdateSampleProvideReport,
  uploadEditorFile as originalUploadEditorFile,
  uploadEdiZip as originalUploadEdiZip,
  uploadFromS3 as originalUploadFromS3,
  uploadHospitalExcel as originalUploadHospitalExcel,
  uploadPartnerEdiFiles as originalUploadPartnerEdiFiles,
  uploadPartnersExcel as originalUploadPartnersExcel,
  uploadProductExtraInfo as originalUploadProductExtraInfo,
  uploadSettlementExcel as originalUploadSettlementExcel,
  verifyCode as originalVerifyCode,
  whoAmI as originalWhoAmI,
} from './backend';

const MockPrescriptionResponse: PrescriptionResponse[] = [
  {
    id: 1,
    dealerId: 101,
    userId: 'MockUser001',
    companyName: 'MockCompany001',
    dealerName: 'MockDealer001',
    prescriptionMonth: '2024-01-01',
    settlementMonth: '2024-02-01',
    submittedAt: '2024-01-15T09:30:00Z',
    status: 'COMPLETED',
    checkedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: 2,
    dealerId: 102,
    userId: 'MockUser002',
    companyName: 'MockCompany002',
    dealerName: 'MockDealer002',
    prescriptionMonth: '2024-01-01',
    settlementMonth: '2024-02-01',
    submittedAt: '2024-01-18T11:15:00Z',
    status: 'IN_PROGRESS',
    checkedAt: null,
  },
  {
    id: 3,
    dealerId: 103,
    userId: 'MockUser003',
    companyName: 'MockCompany003',
    dealerName: 'MockDealer003',
    prescriptionMonth: '2024-02-01',
    settlementMonth: '2024-03-01',
    submittedAt: '2024-02-05T08:20:00Z',
    status: 'PENDING',
    checkedAt: null,
  },
  {
    id: 4,
    dealerId: 104,
    userId: 'MockUser004',
    companyName: 'MockCompany004',
    dealerName: 'MockDealer004',
    prescriptionMonth: '2024-02-01',
    settlementMonth: '2024-03-01',
    submittedAt: '2024-02-10T16:30:00Z',
    status: 'COMPLETED',
    checkedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: 5,
    dealerId: 105,
    userId: 'MockUser005',
    companyName: 'MockCompany005',
    dealerName: 'MockDealer005',
    prescriptionMonth: '2024-03-01',
    settlementMonth: '2024-04-01',
    submittedAt: '2024-03-12T13:45:00Z',
    status: 'IN_PROGRESS',
    checkedAt: null,
  },
  {
    id: 6,
    dealerId: 106,
    userId: 'MockUser006',
    companyName: 'MockCompany006',
    dealerName: 'MockDealer006',
    prescriptionMonth: '2024-03-01',
    settlementMonth: '2024-04-01',
    submittedAt: '2024-03-20T07:30:00Z',
    status: 'PENDING',
    checkedAt: null,
  },
  {
    id: 7,
    dealerId: 107,
    userId: 'MockUser007',
    companyName: 'MockCompany007',
    dealerName: 'MockDealer007',
    prescriptionMonth: '2024-04-01',
    settlementMonth: '2024-05-01',
    submittedAt: '2024-04-08T12:15:00Z',
    status: 'COMPLETED',
    checkedAt: '2024-04-12T15:30:00Z',
  },
  {
    id: 8,
    dealerId: 108,
    userId: 'MockUser008',
    companyName: 'MockCompany008',
    dealerName: 'MockDealer008',
    prescriptionMonth: '2024-04-01',
    settlementMonth: '2024-05-01',
    submittedAt: '2024-04-15T09:00:00Z',
    status: 'IN_PROGRESS',
    checkedAt: null,
  },
  {
    id: 9,
    dealerId: 109,
    userId: 'MockUser009',
    companyName: 'MockCompany009',
    dealerName: 'MockDealer009',
    prescriptionMonth: '2024-05-01',
    settlementMonth: '2024-06-01',
    submittedAt: '2024-05-03T14:20:00Z',
    status: 'PENDING',
    checkedAt: null,
  },
  {
    id: 10,
    dealerId: 110,
    userId: 'MockUser010',
    companyName: 'MockCompany010',
    dealerName: 'MockDealer010',
    prescriptionMonth: '2024-05-01',
    settlementMonth: '2024-06-01',
    submittedAt: '2024-05-18T11:45:00Z',
    status: 'COMPLETED',
    checkedAt: '2024-05-22T16:15:00Z',
  },
];

const MockPrescriptionPartnerResponse: PrescriptionPartnerResponse[] = [
  {
    id: 1,
    companyName: 'MockCompany001',
    drugCompany: 'MockDrugCompany001',
    institutionCode: 'INST001',
    prescriptionMonth: '2024-01-01',
    settlementMonth: '2024-02-01',
    inputDate: '2024-01-15',
    amount: 125000,
    status: 'COMPLETED',
    dealerName: 'MockDealer001',
    partnerName: 'MockPartner001',
    businessNumber: '123-45-67890',
  },
  {
    id: 2,
    companyName: 'MockCompany002',
    drugCompany: 'MockDrugCompany002',
    institutionCode: 'INST002',
    prescriptionMonth: '2024-01-01',
    settlementMonth: '2024-02-01',
    inputDate: '2024-01-18',
    amount: 89500,
    status: 'IN_PROGRESS',
    dealerName: 'MockDealer002',
    partnerName: 'MockPartner002',
    businessNumber: '234-56-78901',
  },
  {
    id: 3,
    companyName: 'MockCompany003',
    drugCompany: 'MockDrugCompany003',
    institutionCode: 'INST003',
    prescriptionMonth: '2024-02-01',
    settlementMonth: '2024-03-01',
    inputDate: '2024-02-05',
    amount: 156750,
    status: 'PENDING',
    dealerName: 'MockDealer003',
    partnerName: 'MockPartner003',
    businessNumber: '345-67-89012',
  },
  {
    id: 4,
    companyName: 'MockCompany004',
    drugCompany: 'MockDrugCompany004',
    institutionCode: 'INST004',
    prescriptionMonth: '2024-02-01',
    settlementMonth: '2024-03-01',
    inputDate: '2024-02-10',
    amount: 203400,
    status: 'COMPLETED',
    dealerName: 'MockDealer004',
    partnerName: 'MockPartner004',
    businessNumber: '456-78-90123',
  },
  {
    id: 5,
    companyName: 'MockCompany005',
    drugCompany: 'MockDrugCompany005',
    institutionCode: 'INST005',
    prescriptionMonth: '2024-03-01',
    settlementMonth: '2024-04-01',
    inputDate: '2024-03-12',
    amount: 78200,
    status: 'IN_PROGRESS',
    dealerName: 'MockDealer005',
    partnerName: 'MockPartner005',
    businessNumber: '567-89-01234',
  },
  {
    id: 6,
    companyName: 'MockCompany006',
    drugCompany: 'MockDrugCompany006',
    institutionCode: 'INST006',
    prescriptionMonth: '2024-03-01',
    settlementMonth: '2024-04-01',
    inputDate: '2024-03-20',
    amount: 192800,
    status: 'PENDING',
    dealerName: 'MockDealer006',
    partnerName: 'MockPartner006',
    businessNumber: '678-90-12345',
  },
  {
    id: 7,
    companyName: 'MockCompany007',
    drugCompany: 'MockDrugCompany007',
    institutionCode: 'INST007',
    prescriptionMonth: '2024-04-01',
    settlementMonth: '2024-05-01',
    inputDate: '2024-04-08',
    amount: 167300,
    status: 'COMPLETED',
    dealerName: 'MockDealer007',
    partnerName: 'MockPartner007',
    businessNumber: '789-01-23456',
  },
  {
    id: 8,
    companyName: 'MockCompany008',
    drugCompany: 'MockDrugCompany008',
    institutionCode: 'INST008',
    prescriptionMonth: '2024-04-01',
    settlementMonth: '2024-05-01',
    inputDate: '2024-04-15',
    amount: 145600,
    status: 'IN_PROGRESS',
    dealerName: 'MockDealer008',
    partnerName: 'MockPartner008',
    businessNumber: '890-12-34567',
  },
  {
    id: 9,
    companyName: 'MockCompany009',
    drugCompany: 'MockDrugCompany009',
    institutionCode: 'INST009',
    prescriptionMonth: '2024-05-01',
    settlementMonth: '2024-06-01',
    inputDate: '2024-05-03',
    amount: 112900,
    status: 'PENDING',
    dealerName: 'MockDealer009',
    partnerName: 'MockPartner009',
    businessNumber: '901-23-45678',
  },
  {
    id: 10,
    companyName: 'MockCompany010',
    drugCompany: 'MockDrugCompany010',
    institutionCode: 'INST010',
    prescriptionMonth: '2024-05-01',
    settlementMonth: '2024-06-01',
    inputDate: '2024-05-18',
    amount: 184700,
    status: 'COMPLETED',
    dealerName: 'MockDealer010',
    partnerName: 'MockPartner010',
    businessNumber: '012-34-56789',
  },
];

const MockPrescriptionPartnerProductResponse: PrescriptionPartnerProductResponse[] = [
  {
    id: 1,
    productCode: 'PRD001',
    productName: 'MockProduct001',
    unit: 'MockUnit001',
    quantity: 100,
    unitPrice: 1250,
    totalPrice: 125000,
    baseFeeRate: 0.15,
    feeAmount: 18750,
    note: 'MockNote001',
  },
  {
    id: 2,
    productCode: 'PRD002',
    productName: 'MockProduct002',
    unit: 'MockUnit002',
    quantity: 75,
    unitPrice: 1800,
    totalPrice: 135000,
    baseFeeRate: 0.12,
    feeAmount: 16200,
    note: null,
  },
  {
    id: 3,
    productCode: 'PRD003',
    productName: 'MockProduct003',
    unit: 'MockUnit003',
    quantity: 200,
    unitPrice: 950,
    totalPrice: 190000,
    baseFeeRate: 0.18,
    feeAmount: 34200,
    note: 'MockNote003',
  },
];

const MockAttachedFileResponse: AttachedFileResponse[] = [
  {
    fileId: 1,
    fileName: 'MockFile001.edi',
    fileUrl: '/edi-example.jpeg',
  },
  {
    fileId: 2,
    fileName: 'MockFile002.edi',
    fileUrl: '/edi-example.jpeg',
  },
  {
    fileId: 3,
    fileName: 'MockFile003.zip',
    fileUrl: '/edi-example.jpeg',
  },
];

const MockSalesAgencyProductSummaryResponse: SalesAgencyProductSummaryResponse[] = [
  {
    id: 1,
    clientName: 'MockClient001',
    productName: 'MockSalesProduct001',
    price: 50000,
    contractDate: '2024-01-15',
    isExposed: true,
    startAt: '2024-02-01',
    endAt: '2024-04-30',
    appliedCount: 25,
    quantity: 100,
    thumbnailUrl: 'https://mock-storage.example.com/thumbnails/MockProduct001.jpg',
  },
  {
    id: 2,
    clientName: 'MockClient002',
    productName: 'MockSalesProduct002',
    price: 75000,
    contractDate: '2024-01-20',
    isExposed: true,
    startAt: '2024-02-15',
    endAt: '2024-05-15',
    appliedCount: 18,
    quantity: 50,
    thumbnailUrl: null,
  },
  {
    id: 3,
    clientName: 'MockClient003',
    productName: 'MockSalesProduct003',
    price: 35000,
    contractDate: '2024-02-01',
    isExposed: false,
    startAt: '2024-03-01',
    endAt: '2024-06-01',
    appliedCount: 42,
    quantity: 200,
    thumbnailUrl: 'https://mock-storage.example.com/thumbnails/MockProduct003.jpg',
  },
  {
    id: 4,
    clientName: 'MockClient004',
    productName: 'MockSalesProduct004',
    price: 120000,
    contractDate: '2024-02-10',
    isExposed: true,
    startAt: '2024-03-15',
    endAt: '2024-07-15',
    appliedCount: 12,
    quantity: 30,
    thumbnailUrl: 'https://mock-storage.example.com/thumbnails/MockProduct004.jpg',
  },
  {
    id: 5,
    clientName: 'MockClient005',
    productName: 'MockSalesProduct005',
    price: 85000,
    contractDate: '2024-02-25',
    isExposed: true,
    startAt: '2024-04-01',
    endAt: '2024-08-01',
    appliedCount: 33,
    quantity: 75,
    thumbnailUrl: null,
  },
];

const MockSalesAgencyProductDetailsResponse: SalesAgencyProductDetailsResponse[] = [
  {
    productId: 1,
    clientName: 'MockClient001',
    productName: 'MockSalesProduct001',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    contractDate: '2024-01-15',
    thumbnailUrl: 'https://mock-storage.example.com/thumbnails/MockProduct001.jpg',
    videoUrl: 'https://mock-storage.example.com/videos/MockProduct001.mp4',
    note: 'MockNote001',
    quantity: 100,
    price: 50000,
    boardPostDetail: {
      id: 1,
      userId: 'MockUser001',
      name: 'MockName001',
      memberType: 'CSO',
      boardType: 'SALES_AGENCY',
      title: 'MockTitle001',
      content: 'MockContent001',
      nickname: 'MockNickname001',
      isBlind: false,
      likesCount: 15,
      viewsCount: 234,
      commentCount: 8,
      isExposed: true,
      exposureRange: 'ALL',
      createdAt: '2024-01-15T10:00:00Z',
      children: [],
      reports: [],
      comments: [],
      attachments: [],
      noticeProperties: null,
    },
  },
  {
    productId: 2,
    clientName: 'MockClient002',
    productName: 'MockSalesProduct002',
    startDate: '2024-02-15',
    endDate: '2024-05-15',
    contractDate: '2024-01-20',
    thumbnailUrl: 'https://mock-storage.example.com/thumbnails/MockProduct002.jpg',
    videoUrl: null,
    note: 'MockNote002',
    quantity: 50,
    price: 75000,
    boardPostDetail: {
      id: 2,
      userId: 'MockUser002',
      name: 'MockName002',
      memberType: 'INDIVIDUAL',
      boardType: 'SALES_AGENCY',
      title: 'MockTitle002',
      content: 'MockContent002',
      nickname: 'MockNickname002',
      isBlind: false,
      likesCount: 22,
      viewsCount: 145,
      commentCount: 5,
      isExposed: true,
      exposureRange: 'CONTRACTED',
      createdAt: '2024-01-20T14:30:00Z',
      children: [],
      reports: [],
      comments: [],
      attachments: [],
      noticeProperties: null,
    },
  },
];

const MockSalesAgencyProductApplicantResponse: SalesAgencyProductApplicantResponse[] = [
  {
    id: 1,
    userId: 'MockUser001',
    memberName: 'MockMember001',
    phoneNumber: '010-1111-1111',
    appliedDate: '2024-02-05',
    contractStatus: 'CONTRACT',
    note: 'MockApplicantNote001',
  },
  {
    id: 2,
    userId: 'MockUser002',
    memberName: 'MockMember002',
    phoneNumber: '010-2222-2222',
    appliedDate: '2024-02-06',
    contractStatus: 'NON_CONTRACT',
    note: null,
  },
  {
    id: 3,
    userId: 'MockUser003',
    memberName: 'MockMember003',
    phoneNumber: '010-3333-3333',
    appliedDate: '2024-02-07',
    contractStatus: 'CONTRACT',
    note: 'MockApplicantNote003',
  },
  {
    id: 4,
    userId: 'MockUser004',
    memberName: 'MockMember004',
    phoneNumber: '010-4444-4444',
    appliedDate: '2024-02-08',
    contractStatus: 'NON_CONTRACT',
    note: null,
  },
  {
    id: 5,
    userId: 'MockUser005',
    memberName: 'MockMember005',
    phoneNumber: '010-5555-5555',
    appliedDate: '2024-02-09',
    contractStatus: 'CONTRACT',
    note: 'MockApplicantNote005',
  },
];

const MockMemberResponse: MemberResponse[] = [
  {
    id: 1,
    userId: 'MockUser001',
    name: 'MockName001',
    phoneNumber: '010-1111-1111',
    birthDate: '1990-01-15',
    email: 'mock001@example.com',
    partnerContractStatus: 'CSO',
    marketingConsent: true,
    registrationDate: '2024-01-01',
    lastLoginDate: '2024-01-15',
    hasCsoCert: true,
    accountStatus: 'ACTIVATED',
    role: 'USER',
    companyName: 'MockCompany001',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    userId: 'MockUser002',
    name: 'MockName002',
    phoneNumber: '010-2222-2222',
    birthDate: '1985-05-22',
    email: 'mock002@example.com',
    partnerContractStatus: 'INDIVIDUAL',
    marketingConsent: false,
    registrationDate: '2024-01-02',
    lastLoginDate: '2024-01-16',
    hasCsoCert: false,
    accountStatus: 'ACTIVATED',
    role: 'USER',
    companyName: 'MockCompany002',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    userId: 'MockUser003',
    name: 'MockName003',
    phoneNumber: '010-3333-3333',
    birthDate: '1992-08-10',
    email: 'mock003@example.com',
    partnerContractStatus: 'ORGANIZATION',
    marketingConsent: true,
    registrationDate: '2024-01-03',
    lastLoginDate: '2024-01-17',
    hasCsoCert: true,
    accountStatus: 'ACTIVATED',
    role: 'USER',
    companyName: 'MockCompany003',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 4,
    userId: 'MockUser004',
    name: 'MockName004',
    phoneNumber: '010-4444-4444',
    birthDate: '1988-12-05',
    email: 'mock004@example.com',
    partnerContractStatus: 'NONE',
    marketingConsent: false,
    registrationDate: '2024-01-04',
    lastLoginDate: '2024-01-18',
    hasCsoCert: false,
    accountStatus: 'BLOCKED',
    role: 'USER',
    companyName: null,
    createdAt: '2024-01-04T00:00:00Z',
  },
  {
    id: 5,
    userId: 'MockUser005',
    name: 'MockName005',
    phoneNumber: '010-5555-5555',
    birthDate: '1995-03-18',
    email: 'mock005@example.com',
    partnerContractStatus: 'CSO',
    marketingConsent: true,
    registrationDate: '2024-01-05',
    lastLoginDate: '2024-01-19',
    hasCsoCert: true,
    accountStatus: 'ACTIVATED',
    role: 'ADMIN',
    companyName: 'MockCompany005',
    createdAt: '2024-01-05T00:00:00Z',
  },
];

const MockMemberDetailsResponse: MemberDetailsResponse[] = [
  {
    id: 1,
    userId: 'MockUser001',
    name: 'MockName001',
    gender: 'MALE',
    phoneNumber: '010-1111-1111',
    birthDate: '1990-01-15',
    email: 'mock001@example.com',
    partnerContractStatus: 'CSO',
    marketingAgreements: {
      sms: true,
      email: true,
      push: false,
    },
    referralCode: 'REF001',
    csoCertUrl: 'https://mock-storage.example.com/cso/cert001.pdf',
    registrationDate: '2024-01-01',
    lastLoginDate: '2024-01-15',
    note: 'MockNote001',
    role: 'USER',
  },
  {
    id: 2,
    userId: 'MockUser002',
    name: 'MockName002',
    gender: 'FEMALE',
    phoneNumber: '010-2222-2222',
    birthDate: '1985-05-22',
    email: 'mock002@example.com',
    partnerContractStatus: 'INDIVIDUAL',
    marketingAgreements: {
      sms: false,
      email: true,
      push: true,
    },
    referralCode: 'REF002',
    csoCertUrl: null,
    registrationDate: '2024-01-02',
    lastLoginDate: '2024-01-16',
    note: 'MockNote002',
    role: 'USER',
  },
  {
    id: 3,
    userId: 'MockUser003',
    name: 'MockName003',
    gender: null,
    phoneNumber: '010-3333-3333',
    birthDate: '1992-08-10',
    email: 'mock003@example.com',
    partnerContractStatus: 'ORGANIZATION',
    marketingAgreements: {
      sms: true,
      email: false,
      push: true,
    },
    referralCode: 'REF003',
    csoCertUrl: 'https://mock-storage.example.com/cso/cert003.pdf',
    registrationDate: '2024-01-03',
    lastLoginDate: '2024-01-17',
    note: 'MockNote003',
    role: 'USER',
  },
  {
    id: 4,
    userId: 'MockUser004',
    name: 'MockName004',
    gender: 'MALE',
    phoneNumber: '010-4444-4444',
    birthDate: '1988-12-05',
    email: 'mock004@example.com',
    partnerContractStatus: 'NONE',
    marketingAgreements: {
      sms: false,
      email: false,
      push: false,
    },
    referralCode: null,
    csoCertUrl: null,
    registrationDate: '2024-01-04',
    lastLoginDate: '2024-01-18',
    note: null,
    role: 'USER',
  },
  {
    id: 5,
    userId: 'MockUser005',
    name: 'MockName005',
    gender: 'FEMALE',
    phoneNumber: '010-5555-5555',
    birthDate: '1995-03-18',
    email: 'mock005@example.com',
    partnerContractStatus: 'CSO',
    marketingAgreements: {
      sms: true,
      email: true,
      push: true,
    },
    referralCode: 'REF005',
    csoCertUrl: 'https://mock-storage.example.com/cso/cert005.pdf',
    registrationDate: '2024-01-05',
    lastLoginDate: '2024-01-19',
    note: 'MockNote005',
    role: 'ADMIN',
  },
];

const MockAdminPermissionResponse: AdminPermissionResponse = {
  permissions: ['MEMBER_MANAGEMENT', 'PRODUCT_MANAGEMENT', 'TRANSACTION_MANAGEMENT', 'PRESCRIPTION_MANAGEMENT', 'ALL'],
};

const MockPartnerResponse: PartnerResponse[] = [
  {
    id: 1,
    drugCompany: 'MockDrugCompany001',
    companyName: 'MockCompany001',
    contractType: 'CONTRACT',
    institutionCode: 'INST001',
    institutionName: 'MockInstitution001',
    businessNumber: '123-45-67890',
    medicalDepartment: 'MockDepartment001',
    hasPharmacy: true,
    pharmacyName: 'MockPharmacy001',
    pharmacyAddress: 'MockAddress001',
    pharmacyStatus: 'NORMAL',
    note: 'MockNote001',
  },
  {
    id: 2,
    drugCompany: 'MockDrugCompany002',
    companyName: 'MockCompany002',
    contractType: 'NON_CONTRACT',
    institutionCode: 'INST002',
    institutionName: 'MockInstitution002',
    businessNumber: '234-56-78901',
    medicalDepartment: 'MockDepartment002',
    hasPharmacy: false,
    pharmacyName: null,
    pharmacyAddress: null,
    pharmacyStatus: 'NONE',
    note: 'MockNote002',
  },
  {
    id: 3,
    drugCompany: 'MockDrugCompany003',
    companyName: 'MockCompany003',
    contractType: 'CONTRACT',
    institutionCode: 'INST003',
    institutionName: 'MockInstitution003',
    businessNumber: '345-67-89012',
    medicalDepartment: 'MockDepartment003',
    hasPharmacy: true,
    pharmacyName: 'MockPharmacy003',
    pharmacyAddress: 'MockAddress003',
    pharmacyStatus: 'NORMAL',
    note: 'MockNote003',
  },
  {
    id: 4,
    drugCompany: 'MockDrugCompany004',
    companyName: 'MockCompany004',
    contractType: 'CONTRACT',
    institutionCode: 'INST004',
    institutionName: 'MockInstitution004',
    businessNumber: '456-78-90123',
    medicalDepartment: 'MockDepartment004',
    hasPharmacy: true,
    pharmacyName: 'MockPharmacy004',
    pharmacyAddress: 'MockAddress004',
    pharmacyStatus: 'CLOSED',
    note: 'MockNote004',
  },
  {
    id: 5,
    drugCompany: 'MockDrugCompany005',
    companyName: 'MockCompany005',
    contractType: 'NON_CONTRACT',
    institutionCode: 'INST005',
    institutionName: 'MockInstitution005',
    businessNumber: '567-89-01234',
    medicalDepartment: 'MockDepartment005',
    hasPharmacy: false,
    pharmacyName: null,
    pharmacyAddress: null,
    pharmacyStatus: 'NONE',
    note: null,
  },
];

const MockPartnerContractDetailsResponse: PartnerContractDetailsResponse = {
  contractType: 'INDIVIDUAL',
  companyName: 'MockCompany001',
  businessNumber: '123-45-67890',
  bankName: 'MockBank',
  accountNumber: '1234567890',
  contractDate: '2024-01-15T00:00:00Z',
  status: 'APPROVED',
  fileUrls: {
    business_registration: 'https://mock-storage.example.com/contracts/business_reg.pdf',
    subcontract_agreement: 'https://mock-storage.example.com/contracts/subcontract.pdf',
    cso_certificate: 'https://mock-storage.example.com/contracts/cso_cert.pdf',
    education_certificate: 'https://mock-storage.example.com/contracts/education_cert.pdf',
  },
};

const MockBannerResponse: BannerResponse[] = [
  {
    id: 1,
    title: 'MockBannerTitle001',
    linkUrl: 'https://mock-site.example.com/banner001',
    status: 'VISIBLE',
    scope: 'ENTIRE',
    position: 'TOP',
    displayOrder: 1,
    viewCount: 1250,
    clickCount: 85,
    ctr: 6.8,
    startAt: '2024-01-01T00:00:00Z',
    endAt: '2024-12-31T23:59:59Z',
    imageUrl: 'https://mock-storage.example.com/banners/banner001.jpg',
    note: 'MockNote001',
  },
  {
    id: 2,
    title: 'MockBannerTitle002',
    linkUrl: 'https://mock-site.example.com/banner002',
    status: 'VISIBLE',
    scope: 'CONTRACT',
    position: 'MIDDLE',
    displayOrder: 2,
    viewCount: 890,
    clickCount: 67,
    ctr: 7.5,
    startAt: '2024-02-01T00:00:00Z',
    endAt: '2024-11-30T23:59:59Z',
    imageUrl: 'https://mock-storage.example.com/banners/banner002.jpg',
    note: null,
  },
  {
    id: 3,
    title: 'MockBannerTitle003',
    linkUrl: 'https://mock-site.example.com/banner003',
    status: 'HIDDEN',
    scope: 'NON_CONTRACT',
    position: 'BOTTOM',
    displayOrder: 3,
    viewCount: 542,
    clickCount: 23,
    ctr: 4.2,
    startAt: '2024-03-01T00:00:00Z',
    endAt: '2024-10-31T23:59:59Z',
    imageUrl: 'https://mock-storage.example.com/banners/banner003.jpg',
    note: 'MockNote003',
  },
  {
    id: 4,
    title: 'MockBannerTitle004',
    linkUrl: 'https://mock-site.example.com/banner004',
    status: 'VISIBLE',
    scope: 'ENTIRE',
    position: 'TOP',
    displayOrder: 4,
    viewCount: 1567,
    clickCount: 112,
    ctr: 7.1,
    startAt: '2024-04-01T00:00:00Z',
    endAt: '2024-12-31T23:59:59Z',
    imageUrl: 'https://mock-storage.example.com/banners/banner004.jpg',
    note: null,
  },
  {
    id: 5,
    title: 'MockBannerTitle005',
    linkUrl: 'https://mock-site.example.com/banner005',
    status: 'VISIBLE',
    scope: 'CONTRACT',
    position: 'MIDDLE',
    displayOrder: 5,
    viewCount: 723,
    clickCount: 45,
    ctr: 6.2,
    startAt: '2024-05-01T00:00:00Z',
    endAt: '2024-12-31T23:59:59Z',
    imageUrl: 'https://mock-storage.example.com/banners/banner005.jpg',
    note: 'MockNote005',
  },
];

const MockBoardPostResponse: BoardPostResponse[] = [
  {
    id: 1,
    userId: 'MockUser001',
    name: 'MockName001',
    memberType: 'CSO',
    boardType: 'NOTICE',
    title: 'MockBoardTitle001',
    nickname: 'MockNickname001',
    isBlind: false,
    likesCount: 25,
    viewsCount: 245,
    commentCount: 8,
    createdAt: '2024-01-15T10:00:00Z',
    isExposed: true,
    exposureRange: 'ALL',
    noticeType: 'GENERAL',
  },
  {
    id: 2,
    userId: 'MockUser002',
    name: 'MockName002',
    memberType: 'INDIVIDUAL',
    boardType: 'ANONYMOUS',
    title: 'MockBoardTitle002',
    nickname: 'MockNickname002',
    noticeType: null,
    isBlind: false,
    likesCount: 12,
    viewsCount: 156,
    commentCount: 5,
    createdAt: '2024-01-16T14:30:00Z',
    isExposed: true,
    exposureRange: 'CONTRACTED',
  },
  {
    id: 3,
    userId: 'MockUser003',
    name: 'MockName003',
    memberType: 'ORGANIZATION',
    boardType: 'PRODUCT',
    title: 'MockBoardTitle003',
    nickname: 'MockNickname003',
    noticeType: null,
    isBlind: true,
    likesCount: 8,
    viewsCount: 89,
    commentCount: 2,
    createdAt: '2024-01-17T09:15:00Z',
    isExposed: false,
    exposureRange: 'ALL',
  },
  {
    id: 4,
    userId: 'MockUser004',
    name: 'MockName004',
    memberType: 'NONE',
    boardType: 'FAQ',
    title: 'MockBoardTitle004',
    nickname: 'MockNickname004',
    noticeType: null,
    isBlind: false,
    likesCount: 35,
    viewsCount: 312,
    commentCount: 12,
    createdAt: '2024-01-18T16:45:00Z',
    isExposed: true,
    exposureRange: 'ALL',
  },
  {
    id: 5,
    userId: 'MockUser005',
    name: 'MockName005',
    memberType: 'CSO',
    boardType: 'EVENT',
    title: 'MockBoardTitle005',
    nickname: 'MockNickname005',
    noticeType: null,
    isBlind: false,
    likesCount: 42,
    viewsCount: 456,
    commentCount: 18,
    createdAt: '2024-01-19T11:20:00Z',
    isExposed: true,
    exposureRange: 'CONTRACTED',
  },
];

const MockBoardMemberStatsResponse: BoardMemberStatsResponse[] = [
  {
    name: 'MockMember001',
    id: 1,
    phoneNumber: '010-1111-1111',
    commentCount: 15,
    userId: 'MockUser001',
    contractStatus: 'CONTRACT',
    postCount: 8,
    totalLikes: 45,
    blindPostCount: 1,
  },
  {
    name: 'MockMember002',
    id: 2,
    phoneNumber: '010-2222-2222',
    commentCount: 22,
    userId: 'MockUser002',
    contractStatus: 'NON_CONTRACT',
    postCount: 12,
    totalLikes: 67,
    blindPostCount: 0,
  },
  {
    name: 'MockMember003',
    id: 3,
    phoneNumber: '010-3333-3333',
    commentCount: 8,
    userId: 'MockUser003',
    contractStatus: 'CONTRACT',
    postCount: 5,
    totalLikes: 23,
    blindPostCount: 2,
  },
  {
    name: 'MockMember004',
    id: 4,
    phoneNumber: '010-4444-4444',
    commentCount: 31,
    userId: 'MockUser004',
    contractStatus: 'CONTRACT',
    postCount: 18,
    totalLikes: 89,
    blindPostCount: 0,
  },
  {
    name: 'MockMember005',
    id: 5,
    phoneNumber: '010-5555-5555',
    commentCount: 19,
    userId: 'MockUser005',
    contractStatus: 'NON_CONTRACT',
    postCount: 9,
    totalLikes: 56,
    blindPostCount: 1,
  },
];

const MockBlindPostResponse: BlindPostResponse[] = [
  {
    id: 1,
    memberName: 'MockMember001',
    content: 'MockBlindContent001',
    nickname: 'MockNickname001',
    likesCount: 5,
    reportType: 'SPAM',
    userId: 'MockUser001',
    postType: 'BOARD',
    contractStatus: 'CONTRACT',
    blindAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    memberName: 'MockMember002',
    content: 'MockBlindContent002',
    nickname: 'MockNickname002',
    likesCount: 3,
    reportType: 'ABUSE',
    userId: 'MockUser002',
    postType: 'COMMENT',
    contractStatus: 'NON_CONTRACT',
    blindAt: '2024-01-16T14:15:00Z',
  },
  {
    id: 3,
    memberName: 'MockMember003',
    content: 'MockBlindContent003',
    nickname: 'MockNickname003',
    likesCount: 1,
    reportType: 'ILLEGAL_CONTENT',
    userId: 'MockUser003',
    postType: 'BOARD',
    contractStatus: 'CONTRACT',
    blindAt: '2024-01-17T09:45:00Z',
  },
  {
    id: 4,
    memberName: 'MockMember004',
    content: 'MockBlindContent004',
    nickname: 'MockNickname004',
    likesCount: 7,
    reportType: 'PERSONAL_INFORMATION',
    userId: 'MockUser004',
    postType: 'COMMENT',
    contractStatus: 'CONTRACT',
    blindAt: '2024-01-18T16:20:00Z',
  },
  {
    id: 5,
    memberName: 'MockMember005',
    content: 'MockBlindContent005',
    nickname: 'MockNickname005',
    likesCount: 2,
    reportType: 'OTHER',
    userId: 'MockUser005',
    postType: 'BOARD',
    contractStatus: 'NON_CONTRACT',
    blindAt: '2024-01-19T11:55:00Z',
  },
];

const MockCommentResponse: CommentResponse[] = [
  {
    id: 1,
    userId: 'MockUser001',
    name: 'MockName001',
    content: 'MockCommentContent001',
    nickname: 'MockNickname001',
    likesCount: 8,
    isBlind: false,
    contractStatus: 'CONTRACT',
    parentId: null,
    createdAt: '2024-01-15T10:30:00Z',
    modifiedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    userId: 'MockUser002',
    name: 'MockName002',
    content: 'MockCommentContent002',
    nickname: 'MockNickname002',
    likesCount: 5,
    isBlind: false,
    contractStatus: 'NON_CONTRACT',
    parentId: 1,
    createdAt: '2024-01-15T11:00:00Z',
    modifiedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 3,
    userId: 'MockUser003',
    name: 'MockName003',
    content: 'MockCommentContent003',
    nickname: 'MockNickname003',
    likesCount: 3,
    isBlind: true,
    contractStatus: 'CONTRACT',
    parentId: null,
    createdAt: '2024-01-16T09:15:00Z',
    modifiedAt: '2024-01-16T09:15:00Z',
  },
  {
    id: 4,
    userId: 'MockUser004',
    name: 'MockName004',
    content: 'MockCommentContent004',
    nickname: 'MockNickname004',
    likesCount: 12,
    isBlind: false,
    contractStatus: 'CONTRACT',
    parentId: 2,
    createdAt: '2024-01-16T14:20:00Z',
    modifiedAt: '2024-01-16T14:20:00Z',
  },
  {
    id: 5,
    userId: 'MockUser005',
    name: 'MockName005',
    content: 'MockCommentContent005',
    nickname: 'MockNickname005',
    likesCount: 7,
    isBlind: false,
    contractStatus: 'NON_CONTRACT',
    parentId: null,
    createdAt: '2024-01-17T16:45:00Z',
    modifiedAt: '2024-01-17T16:45:00Z',
  },
];

const MockCommentMemberResponse: CommentMemberResponse[] = [
  {
    name: 'MockMember001',
    id: 1,
    content: 'MockCommentContent001',
    createdAt: '2024-01-15T10:30:00Z',
    nickname: 'MockNickname001',
    likesCount: 8,
    commentType: 'COMMENT',
    userId: 'MockUser001',
    contractStatus: 'CONTRACT',
    isBlind: false,
  },
  {
    name: 'MockMember002',
    id: 2,
    content: 'MockCommentContent002',
    createdAt: '2024-01-15T11:00:00Z',
    nickname: 'MockNickname002',
    likesCount: 5,
    commentType: 'REPLY',
    userId: 'MockUser002',
    contractStatus: 'NON_CONTRACT',
    isBlind: false,
  },
  {
    name: 'MockMember003',
    id: 3,
    content: 'MockCommentContent003',
    createdAt: '2024-01-16T09:15:00Z',
    nickname: 'MockNickname003',
    likesCount: 3,
    commentType: 'COMMENT',
    userId: 'MockUser003',
    contractStatus: 'CONTRACT',
    isBlind: true,
  },
  {
    name: 'MockMember004',
    id: 4,
    content: 'MockCommentContent004',
    createdAt: '2024-01-16T14:20:00Z',
    nickname: 'MockNickname004',
    likesCount: 12,
    commentType: 'REPLY',
    userId: 'MockUser004',
    contractStatus: 'CONTRACT',
    isBlind: false,
  },
  {
    name: 'MockMember005',
    id: 5,
    content: 'MockCommentContent005',
    createdAt: '2024-01-17T16:45:00Z',
    nickname: 'MockNickname005',
    likesCount: 7,
    commentType: 'COMMENT',
    userId: 'MockUser005',
    contractStatus: 'NON_CONTRACT',
    isBlind: false,
  },
];

const MockEventBoardSummaryResponse: EventBoardSummaryResponse[] = [
  {
    id: 1,
    title: 'MockEventTitle001',
    thumbnailUrl: 'https://mock-storage.example.com/events/thumb001.jpg',
    eventStartAt: '2024-02-01T09:00:00Z',
    eventEndAt: '2024-02-03T18:00:00Z',
    isExposed: true,
    viewCount: 456,
    createdDate: '2024-01-15T10:00:00Z',
    eventStatus: 'IN_PROGRESS',
  },
  {
    id: 2,
    title: 'MockEventTitle002',
    thumbnailUrl: 'https://mock-storage.example.com/events/thumb002.jpg',
    eventStartAt: '2024-03-15T10:00:00Z',
    eventEndAt: '2024-03-17T17:00:00Z',
    isExposed: true,
    viewCount: 289,
    createdDate: '2024-01-20T14:30:00Z',
    eventStatus: 'FINISHED',
  },
  {
    id: 3,
    title: 'MockEventTitle003',
    thumbnailUrl: 'https://mock-storage.example.com/events/thumb003.jpg',
    eventStartAt: '2024-04-10T08:30:00Z',
    eventEndAt: '2024-04-12T19:30:00Z',
    isExposed: false,
    viewCount: 123,
    createdDate: '2024-02-01T09:15:00Z',
    eventStatus: 'IN_PROGRESS',
  },
  {
    id: 4,
    title: 'MockEventTitle004',
    thumbnailUrl: 'https://mock-storage.example.com/events/thumb004.jpg',
    eventStartAt: '2024-05-20T11:00:00Z',
    eventEndAt: '2024-05-22T16:00:00Z',
    isExposed: true,
    viewCount: 612,
    createdDate: '2024-02-15T16:45:00Z',
    eventStatus: 'FINISHED',
  },
  {
    id: 5,
    title: 'MockEventTitle005',
    thumbnailUrl: 'https://mock-storage.example.com/events/thumb005.jpg',
    eventStartAt: '2024-06-05T09:30:00Z',
    eventEndAt: '2024-06-07T18:30:00Z',
    isExposed: true,
    viewCount: 334,
    createdDate: '2024-03-01T11:20:00Z',
    eventStatus: 'IN_PROGRESS',
  },
];

const MockEventBoardDetailsResponse: EventBoardDetailsResponse = {
  eventId: 1,
  eventStartDate: 20240201,
  eventEndDate: 20240203,
  description: 'MockEventDescription001',
  thumbnailUrl: 'https://mock-storage.example.com/events/thumb001.jpg',
  videoUrl: 'https://mock-storage.example.com/events/video001.mp4',
  note: 'MockEventNote001',
  boardPostDetail: {
    id: 1,
    userId: 'MockUser001',
    name: 'MockName001',
    memberType: 'CSO',
    boardType: 'EVENT',
    title: 'MockEventTitle001',
    content: 'MockEventContent001',
    nickname: 'MockNickname001',
    isBlind: false,
    likesCount: 25,
    viewsCount: 456,
    commentCount: 12,
    isExposed: true,
    exposureRange: 'ALL',
    createdAt: '2024-01-15T10:00:00Z',
    children: [],
    reports: [],
    comments: [],
    attachments: [],
    noticeProperties: null,
  },
};

const MockExpenseReportResponse: ExpenseReportResponse[] = [
  {
    reportId: 1,
    userId: 'MockUser001',
    companyName: 'MockCompany001',
    productName: 'MockProduct001',
    institutionType: 'HOSPITAL',
    reportType: 'SAMPLE_PROVIDE',
    status: 'COMPLETED',
    eventStartAt: '2024-01-15T09:00:00Z',
    eventEndAt: '2024-01-15T17:00:00Z',
    supportAmount: 125000,
  },
  {
    reportId: 2,
    userId: 'MockUser002',
    companyName: 'MockCompany002',
    productName: 'MockProduct002',
    institutionType: 'CLINIC',
    reportType: 'PRODUCT_BRIEFING_SINGLE',
    status: 'PENDING',
    eventStartAt: '2024-01-20T10:00:00Z',
    eventEndAt: '2024-01-20T18:00:00Z',
    supportAmount: 85000,
  },
  {
    reportId: 3,
    userId: 'MockUser003',
    companyName: 'MockCompany003',
    productName: 'MockProduct003',
    institutionType: 'HOSPITAL',
    reportType: 'PRODUCT_BRIEFING_MULTI',
    status: 'COMPLETED',
    eventStartAt: '2024-02-01T08:30:00Z',
    eventEndAt: '2024-02-01T19:30:00Z',
    supportAmount: 156000,
  },
  {
    reportId: 4,
    userId: 'MockUser004',
    companyName: 'MockCompany004',
    productName: 'MockProduct004',
    institutionType: 'PHARMACY',
    reportType: 'SAMPLE_PROVIDE',
    status: 'PENDING',
    eventStartAt: '2024-02-10T11:00:00Z',
    eventEndAt: '2024-02-10T16:00:00Z',
    supportAmount: 67000,
  },
  {
    reportId: 5,
    userId: 'MockUser005',
    companyName: 'MockCompany005',
    productName: 'MockProduct005',
    institutionType: 'CLINIC',
    reportType: 'PRODUCT_BRIEFING_SINGLE',
    status: 'COMPLETED',
    eventStartAt: '2024-02-15T09:30:00Z',
    eventEndAt: '2024-02-15T18:30:00Z',
    supportAmount: 203000,
  },
];

const MockProductSummaryResponse: ProductSummaryResponse[] = [
  {
    id: 1,
    productName: 'MockProduct001',
    composition: 'MockComposition001',
    productCode: 'PRD001',
    manufacturerName: 'MockManufacturer001',
    note: 'MockProductNote001',
    price: 125000,
    feeRate: 0.15,
    changedFeeRate: 0.18,
    changedMonth: '2024-03',
    isAcquisition: false,
    isPromotion: true,
    isOutOfStock: false,
    isStopSelling: false,
  },
  {
    id: 2,
    productName: 'MockProduct002',
    composition: 'MockComposition002',
    productCode: 'PRD002',
    manufacturerName: 'MockManufacturer002',
    note: 'MockProductNote002',
    price: 89000,
    feeRate: 0.12,
    changedFeeRate: null,
    changedMonth: null,
    isAcquisition: true,
    isPromotion: false,
    isOutOfStock: false,
    isStopSelling: false,
  },
  {
    id: 3,
    productName: 'MockProduct003',
    composition: 'MockComposition003',
    productCode: 'PRD003',
    manufacturerName: 'MockManufacturer003',
    note: 'MockProductNote003',
    price: 156000,
    feeRate: 0.18,
    changedFeeRate: 0.16,
    changedMonth: '2024-04',
    isAcquisition: false,
    isPromotion: false,
    isOutOfStock: true,
    isStopSelling: false,
  },
  {
    id: 4,
    productName: 'MockProduct004',
    composition: 'MockComposition004',
    productCode: 'PRD004',
    manufacturerName: 'MockManufacturer004',
    note: null,
    price: 67000,
    feeRate: 0.1,
    changedFeeRate: null,
    changedMonth: null,
    isAcquisition: false,
    isPromotion: true,
    isOutOfStock: false,
    isStopSelling: true,
  },
  {
    id: 5,
    productName: 'MockProduct005',
    composition: 'MockComposition005',
    productCode: 'PRD005',
    manufacturerName: 'MockManufacturer005',
    note: 'MockProductNote005',
    price: 203000,
    feeRate: 0.2,
    changedFeeRate: null,
    changedMonth: null,
    isAcquisition: true,
    isPromotion: false,
    isOutOfStock: false,
    isStopSelling: false,
  },
];

const MockProductDetailsResponse: ProductDetailsResponse = {
  manufacturer: 'MockManufacturer001',
  productName: 'MockProduct001',
  composition: 'MockComposition001',
  price: 125000,
  priceUnit: 'KRW',
  feeRate: 0.15,
  changedFeeRate: 0.18,
  changedMonth: '2024-03',
  productCode: 'PRD001',
  isPromotion: true,
  isOutOfStock: false,
  isStopSelling: false,
  isAcquisition: false,
  note: 'MockProductNote001',
  alternativeProducts: ['PRD002', 'PRD003'],
  boardDetailsResponse: {
    id: 1,
    userId: 'MockUser001',
    name: 'MockName001',
    memberType: 'CSO',
    boardType: 'PRODUCT',
    title: 'MockProductTitle001',
    content: 'MockProductContent001',
    nickname: 'MockNickname001',
    isBlind: false,
    likesCount: 35,
    viewsCount: 567,
    commentCount: 15,
    isExposed: true,
    exposureRange: 'ALL',
    createdAt: '2024-01-15T10:00:00Z',
    children: [],
    reports: [],
    comments: [],
    attachments: [],
    noticeProperties: null,
  },
};

const MockHospitalResponse: HospitalResponse[] = [
  {
    id: 1,
    name: 'MockHospital001',
    sido: 'MockSido001',
    sigungu: 'MockSigungu001',
    address: 'MockAddress001',
    scheduledOpenDate: '2024-03-01T00:00:00Z',
    source: 'MockSource001',
  },
  {
    id: 2,
    name: 'MockHospital002',
    sido: 'MockSido002',
    sigungu: 'MockSigungu002',
    address: 'MockAddress002',
    scheduledOpenDate: '2024-04-15T00:00:00Z',
    source: 'MockSource002',
  },
  {
    id: 3,
    name: 'MockHospital003',
    sido: 'MockSido003',
    sigungu: 'MockSigungu003',
    address: 'MockAddress003',
    scheduledOpenDate: '2024-05-10T00:00:00Z',
    source: 'MockSource003',
  },
  {
    id: 4,
    name: 'MockHospital004',
    sido: 'MockSido004',
    sigungu: 'MockSigungu004',
    address: 'MockAddress004',
    scheduledOpenDate: '2024-06-01T00:00:00Z',
    source: 'MockSource004',
  },
  {
    id: 5,
    name: 'MockHospital005',
    sido: 'MockSido005',
    sigungu: 'MockSigungu005',
    address: 'MockAddress005',
    scheduledOpenDate: '2024-07-20T00:00:00Z',
    source: 'MockSource005',
  },
];

const MockEditorUploadResponse: EditorUploadResponse = {
  s3FileId: 1,
  fileName: 'MockEditorFile001.jpg',
  fileUrl: 'https://mock-storage.example.com/editor/MockEditorFile001.jpg',
};

const MockSampleProvideReportDetailResponse: SampleProvideReportDetailResponse = {
  reportId: 1,
  reportType: 'SAMPLE_PROVIDE',
  productName: 'MockProduct001',
  productCode: 'PRD001',
  packCount: 50,
  provideCount: 25,
  institutionName: 'MockInstitution001',
  institutionCode: 'INST001',
  providedAt: '2024-01-15T09:00:00Z',
  attachedFiles: MockAttachedFileResponse,
  status: 'COMPLETED',
};

const MockProductBriefingSingleDetailResponse: ProductBriefingSingleDetailResponse = {
  reportId: 1,
  productName: 'MockProduct001',
  productCode: 'PRD001',
  institutionName: 'MockInstitution001',
  institutionCode: 'INST001',
  supportAmount: 125000,
  location: 'MockLocation001',
  eventAt: '2024-01-15T09:00:00Z',
  isJoint: false,
  medicalPersons: [
    {
      name: 'MockDoctor001',
      employeeCode: 'EMP001',
      signatureFile: MockAttachedFileResponse[0],
    },
  ],
  attachedFiles: MockAttachedFileResponse,
  status: 'COMPLETED',
};

const MockProductBriefingMultiDetailResponse: ProductBriefingMultiDetailResponse = {
  reportId: 1,
  reportType: 'PRODUCT_BRIEFING_MULTI',
  productName: 'MockProduct001',
  productCode: 'PRD001',
  institutions: [
    { name: 'MockInstitution001', code: 'INST001' },
    { name: 'MockInstitution002', code: 'INST002' },
  ],
  transportationFee: 50000,
  giftFee: 30000,
  accommodationFee: 80000,
  mealFee: 40000,
  location: 'MockLocation001',
  startedAt: '2024-01-15T09:00:00Z',
  endedAt: '2024-01-15T18:00:00Z',
  isJoint: true,
  attachedFiles: MockAttachedFileResponse,
  status: 'COMPLETED',
};

const MockDrugCompanies: string[] = [
  'MockDrugCompany001',
  'MockDrugCompany002',
  'MockDrugCompany003',
  'MockDrugCompany004',
  'MockDrugCompany005',
];

const MockSettlementResponse: SettlementResponse[] = [
  {
    id: 1,
    settlementMonth: 202401,
    dealerId: 101,
    dealerName: 'MockDealer001',
    companyName: 'MockCompany001',
    status: 'REQUEST',
    totalAmount: 5500000,
    supplyAmount: 5000000,
    taxAmount: 500000,
    prescriptionAmount: 4800000,
  },
  {
    id: 2,
    settlementMonth: 202401,
    dealerId: 102,
    dealerName: 'MockDealer002',
    companyName: 'MockCompany002',
    status: 'OBJECTION',
    totalAmount: 3300000,
    supplyAmount: 3000000,
    taxAmount: 300000,
    prescriptionAmount: 2900000,
  },
  {
    id: 3,
    settlementMonth: 202402,
    dealerId: 103,
    dealerName: 'MockDealer003',
    companyName: 'MockCompany003',
    status: 'REQUEST',
    totalAmount: 7700000,
    supplyAmount: 7000000,
    taxAmount: 700000,
    prescriptionAmount: 6800000,
  },
  {
    id: 4,
    settlementMonth: 202402,
    dealerId: 104,
    dealerName: 'MockDealer004',
    companyName: 'MockCompany004',
    status: null,
    totalAmount: 2200000,
    supplyAmount: 2000000,
    taxAmount: 200000,
    prescriptionAmount: 1900000,
  },
  {
    id: 5,
    settlementMonth: 202403,
    dealerId: 105,
    dealerName: 'MockDealer005',
    companyName: null,
    status: 'REQUEST',
    totalAmount: 9900000,
    supplyAmount: 9000000,
    taxAmount: 900000,
    prescriptionAmount: 8700000,
  },
];

const MockPerformanceStatsResponse: PerformanceStatsResponse[] = [
  {
    drugCompany: 'MockDrugCompany001',
    companyName: 'MockCompany001',
    dealerName: 'MockDealer001',
    institutionCode: 'INST001',
    institutionName: 'MockInstitution001',
    settlementMonth: 202401,
    prescriptionAmount: 1250000,
    totalAmount: 1375000,
    feeAmount: 125000,
  },
  {
    drugCompany: 'MockDrugCompany002',
    companyName: 'MockCompany002',
    dealerName: 'MockDealer002',
    institutionCode: 'INST002',
    institutionName: 'MockInstitution002',
    settlementMonth: 202401,
    prescriptionAmount: 895000,
    totalAmount: 984500,
    feeAmount: 89500,
  },
  {
    drugCompany: 'MockDrugCompany003',
    companyName: 'MockCompany003',
    dealerName: 'MockDealer003',
    institutionCode: 'INST003',
    institutionName: 'MockInstitution003',
    settlementMonth: 202402,
    prescriptionAmount: 1567500,
    totalAmount: 1724250,
    feeAmount: 156750,
  },
  {
    drugCompany: null,
    companyName: 'MockCompany004',
    dealerName: 'MockDealer004',
    institutionCode: 'INST004',
    institutionName: 'MockInstitution004',
    settlementMonth: 202402,
    prescriptionAmount: 2034000,
    totalAmount: 2237400,
    feeAmount: 203400,
  },
  {
    drugCompany: 'MockDrugCompany005',
    companyName: null,
    dealerName: 'MockDealer005',
    institutionCode: null,
    institutionName: 'MockInstitution005',
    settlementMonth: 202403,
    prescriptionAmount: 782000,
    totalAmount: 860200,
    feeAmount: 78200,
  },
];

const MockSettlementPartnerResponse: SettlementPartnerResponse[] = [
  {
    settlementPartnerId: 1,
    companyName: 'MockCompany001',
    dealerName: 'MockDealer001',
    institutionCode: 'INST001',
    institutionName: 'MockInstitution001',
    businessNumber: '123-45-67890',
    supplyAmount: 1250000,
    taxAmount: 125000,
    totalAmount: 1375000,
  },
  {
    settlementPartnerId: 2,
    companyName: 'MockCompany002',
    dealerName: 'MockDealer002',
    institutionCode: 'INST002',
    institutionName: 'MockInstitution002',
    businessNumber: '234-56-78901',
    supplyAmount: 895000,
    taxAmount: 89500,
    totalAmount: 984500,
  },
  {
    settlementPartnerId: 3,
    companyName: 'MockCompany003',
    dealerName: 'MockDealer003',
    institutionCode: 'INST003',
    institutionName: 'MockInstitution003',
    businessNumber: '345-67-89012',
    supplyAmount: 1567500,
    taxAmount: 156750,
    totalAmount: 1724250,
  },
  {
    settlementPartnerId: 4,
    companyName: 'MockCompany004',
    dealerName: 'MockDealer004',
    institutionCode: 'INST004',
    institutionName: 'MockInstitution004',
    businessNumber: '456-78-90123',
    supplyAmount: 2034000,
    taxAmount: 203400,
    totalAmount: 2237400,
  },
  {
    settlementPartnerId: 5,
    companyName: 'MockCompany005',
    dealerName: 'MockDealer005',
    institutionCode: 'INST005',
    institutionName: 'MockInstitution005',
    businessNumber: '567-89-01234',
    supplyAmount: 782000,
    taxAmount: 78200,
    totalAmount: 860200,
  },
];

const MockSettlementPartnerProductResponse: SettlementPartnerProductResponse[] = [
  {
    id: 1,
    productCode: 'PRD001',
    productName: 'MockProduct001',
    seq: 1,
    quantity: 100,
    unitPrice: 12500,
    prescriptionAmount: 1250000,
    feeRate: 0.15,
    extraFeeRate: 0.02,
    feeAmount: 187500,
    extraFeeAmount: 25000,
    note: 'MockNote001',
  },
  {
    id: 2,
    productCode: 'PRD002',
    productName: 'MockProduct002',
    seq: 2,
    quantity: 75,
    unitPrice: 18000,
    prescriptionAmount: 1350000,
    feeRate: 0.12,
    extraFeeRate: null,
    feeAmount: 162000,
    extraFeeAmount: null,
    note: null,
  },
  {
    id: 3,
    productCode: 'PRD003',
    productName: 'MockProduct003',
    seq: 3,
    quantity: 200,
    unitPrice: 9500,
    prescriptionAmount: 1900000,
    feeRate: 0.18,
    extraFeeRate: 0.03,
    feeAmount: 342000,
    extraFeeAmount: 57000,
    note: 'MockNote003',
  },
  {
    id: 4,
    productCode: null,
    productName: 'MockProduct004',
    seq: 4,
    quantity: 150,
    unitPrice: 6700,
    prescriptionAmount: 1005000,
    feeRate: 0.1,
    extraFeeRate: null,
    feeAmount: 100500,
    extraFeeAmount: null,
    note: null,
  },
  {
    id: 5,
    productCode: 'PRD005',
    productName: null,
    seq: null,
    quantity: 50,
    unitPrice: 40600,
    prescriptionAmount: 2030000,
    feeRate: 0.2,
    extraFeeRate: 0.05,
    feeAmount: 406000,
    extraFeeAmount: 101500,
    note: 'MockNote005',
  },
];

export const searchPrescriptions: typeof originalSearchPrescriptions = async () => {
  return {
    totalElements: MockPrescriptionResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockPrescriptionResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockPrescriptionResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const getPrescriptionPartnerList: typeof originalGetPrescriptionPartnerList = async () => {
  return {
    totalElements: MockPrescriptionPartnerResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockPrescriptionPartnerResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockPrescriptionPartnerResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const getPrescriptionPartner: typeof originalGetPrescriptionPartner = async (prescriptionPartnerId: number) => {
  const partner = MockPrescriptionPartnerResponse.find(p => p.id === prescriptionPartnerId);

  if (!partner) {
    throw new Error(`No mockup PrescriptionPartner for prescriptionPartnerId=${prescriptionPartnerId}`);
  }

  return partner;
};

export const uploadEdiZip: typeof originalUploadEdiZip = async () => {
  return Promise.resolve();
};

export const createPartnerProducts: typeof originalCreatePartnerProducts = async () => {
  return Promise.resolve();
};

export const uploadPartnerEdiFiles: typeof originalUploadPartnerEdiFiles = async () => {
  return Promise.resolve();
};

export const confirmPrescription: typeof originalConfirmPrescription = async () => {
  return Promise.resolve();
};

export const completePrescriptionPartner: typeof originalCompletePrescriptionPartner = async () => {
  return Promise.resolve();
};

export const getPartnerProducts: typeof originalGetPartnerProducts = async () => {
  return MockPrescriptionPartnerProductResponse;
};

export const getAttachedEdiFiles: typeof originalGetAttachedEdiFiles = async () => {
  return MockAttachedFileResponse;
};

export const downloadZippedEdiFiles: typeof originalDownloadZippedEdiFiles = async () => {
  return Promise.resolve();
};

export const deletePrescriptionPartner: typeof originalDeletePrescriptionPartner = async () => {
  return Promise.resolve();
};

export const getSalesAgencyProducts: typeof originalGetSalesAgencyProducts = async () => {
  return {
    totalElements: MockSalesAgencyProductSummaryResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockSalesAgencyProductSummaryResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockSalesAgencyProductSummaryResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const createSalesAgencyProductBoard: typeof originalCreateSalesAgencyProductBoard = async () => {
  return 'MockCreatedProductId001';
};

export const applyProduct: typeof originalApplyProduct = async () => {
  return Promise.resolve();
};

export const getSalesAgencyProductDetails: typeof originalGetSalesAgencyProductDetails = async (id: number) => {
  const product = MockSalesAgencyProductDetailsResponse.find(p => p.productId === id);

  if (!product) {
    throw new Error(`No mockup SalesAgencyProductDetails for id=${id}`);
  }

  return product;
};

export const updateSalesAgencyProductBoard: typeof originalUpdateSalesAgencyProductBoard = async () => {
  return Promise.resolve();
};

export const updateApplicantNotes: typeof originalUpdateApplicantNotes = async () => {
  return Promise.resolve();
};

export const getProductApplicants: typeof originalGetProductApplicants = async () => {
  return {
    totalElements: MockSalesAgencyProductApplicantResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockSalesAgencyProductApplicantResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockSalesAgencyProductApplicantResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const getUserMembers: typeof originalGetUserMembers = async () => {
  return {
    totalElements: MockMemberResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockMemberResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockMemberResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const signup: typeof originalSignup = async () => {
  return Promise.resolve();
};

export const getMemberDetails: typeof originalGetMemberDetails = async (userId: string) => {
  const member = MockMemberDetailsResponse.find(m => m.userId === userId);

  if (!member) {
    throw new Error(`No mockup MemberDetails for userId=${userId}`);
  }

  return member;
};

export const updateMember: typeof originalUpdateMember = async () => {
  return Promise.resolve();
};

export const deleteMember: typeof originalDeleteMember = async () => {
  return Promise.resolve();
};

export const changePassword: typeof originalChangePassword = async () => {
  return Promise.resolve();
};

export const updateNickname: typeof originalUpdateNickname = async () => {
  return Promise.resolve();
};

export const approveOrRejectCso: typeof originalApproveOrRejectCso = async () => {
  return Promise.resolve();
};

export const updateByAdmin: typeof originalUpdateByAdmin = async () => {
  return Promise.resolve();
};

export const isUserIdAvailable: typeof originalIsUserIdAvailable = async () => {
  return true;
};

export const downloadUserMembersExcel: typeof originalDownloadUserMembersExcel = async () => {
  return new Blob(['mock excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const isAvailableNickname: typeof originalIsAvailableNickname = async () => {
  return true;
};

export const getAdminMembers: typeof originalGetAdminMembers = async () => {
  return {
    totalElements: MockMemberResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockMemberResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockMemberResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const signupByAdmin: typeof originalSignupByAdmin = async () => {
  return Promise.resolve();
};

export const getPermissions: typeof originalGetPermissions = async () => {
  return MockAdminPermissionResponse;
};

export const registerFcmToken: typeof originalRegisterFcmToken = async () => {
  return Promise.resolve();
};

export const getPartners: typeof originalGetPartners = async () => {
  return {
    totalElements: MockPartnerResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockPartnerResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockPartnerResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const createPartner: typeof originalCreatePartner = async () => {
  return Promise.resolve();
};

export const getPartnerDetails: typeof originalGetPartnerDetails = async (id: number) => {
  const partner = MockPartnerResponse.find(p => p.id === id);

  if (!partner) {
    throw new Error(`No mockup PartnerDetails for id=${id}`);
  }

  return partner;
};

export const updatePartner: typeof originalUpdatePartner = async () => {
  return Promise.resolve();
};

export const deletePartner: typeof originalDeletePartner = async () => {
  return Promise.resolve();
};

export const uploadPartnersExcel: typeof originalUploadPartnersExcel = async () => {
  return Promise.resolve();
};

export const getDrugCompanies: typeof originalGetDrugCompanies = async () => {
  return MockDrugCompanies;
};

export const applyContract: typeof originalApplyContract = async () => {
  return Promise.resolve();
};

export const rejectContract: typeof originalRejectContract = async () => {
  return Promise.resolve();
};

export const approveContract: typeof originalApproveContract = async () => {
  return Promise.resolve();
};

export const updateContract: typeof originalUpdateContract = async () => {
  return Promise.resolve();
};

export const getContractDetails: typeof originalGetContractDetails = async () => {
  return MockPartnerContractDetailsResponse;
};

export const getBanners: typeof originalGetBanners = async () => {
  return {
    totalElements: MockBannerResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockBannerResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockBannerResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const createBanner: typeof originalCreateBanner = async () => {
  return 'MockBannerId001';
};

export const getBanner: typeof originalGetBanner = async (id: number) => {
  const banner = MockBannerResponse.find(b => b.id === id);

  if (!banner) {
    throw new Error(`No mockup Banner for id=${id}`);
  }

  return banner;
};

export const updateBanner: typeof originalUpdateBanner = async () => {
  return Promise.resolve();
};

export const getBoards: typeof originalGetBoards = async () => {
  return {
    totalElements: MockBoardPostResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockBoardPostResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockBoardPostResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const createBoardPost: typeof originalCreateBoardPost = async () => {
  return 'MockPostId001';
};

export const getBoardDetails: typeof originalGetBoardDetails = async (id: number) => {
  return {
    id: id,
    userId: 'MockUser001',
    name: 'MockName001',
    memberType: 'CSO',
    boardType: 'NOTICE',
    title: 'MockBoardTitle001',
    content: 'MockBoardContent001',
    nickname: 'MockNickname001',
    isBlind: false,
    likesCount: 25,
    viewsCount: 245,
    commentCount: 8,
    isExposed: true,
    exposureRange: 'ALL',
    createdAt: '2024-01-15T10:00:00Z',
    children: [],
    reports: [],
    comments: MockCommentResponse,
    attachments: [],
    noticeProperties: null,
  };
};

export const updateBoardPost: typeof originalUpdateBoardPost = async () => {
  return 'Updated successfully';
};

export const deleteBoardPost: typeof originalDeleteBoardPost = async () => {
  return Promise.resolve();
};

export const toggleBlindStatus_1: typeof originalToggleBlindStatus1 = async () => {
  return true;
};

export const unblindPost: typeof originalUnblindPost = async () => {
  return Promise.resolve();
};

export const uploadEditorFile: typeof originalUploadEditorFile = async () => {
  return MockEditorUploadResponse;
};

export const getBoardMembers: typeof originalGetBoardMembers = async () => {
  return {
    totalElements: MockBoardMemberStatsResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockBoardMemberStatsResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockBoardMemberStatsResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const getBlindPosts: typeof originalGetBlindPosts = async () => {
  return {
    totalElements: MockBlindPostResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockBlindPostResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockBlindPostResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const toggleLike_1: typeof originalToggleLike1 = async () => {
  return Promise.resolve();
};

export const getEventBoards: typeof originalGetEventBoards = async () => {
  return {
    totalElements: MockEventBoardSummaryResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockEventBoardSummaryResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockEventBoardSummaryResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const createEventBoard: typeof originalCreateEventBoard = async () => {
  return 'MockEventId001';
};

export const getEventBoardDetails: typeof originalGetEventBoardDetails = async () => {
  return MockEventBoardDetailsResponse;
};

export const updateEventBoard: typeof originalUpdateEventBoard = async () => {
  return Promise.resolve();
};

export const softDeleteEventBoard: typeof originalSoftDeleteEventBoard = async () => {
  return Promise.resolve();
};

export const getProductSummaries: typeof originalGetProductSummaries = async () => {
  return {
    totalElements: MockProductSummaryResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockProductSummaryResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockProductSummaryResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const getProductDetails: typeof originalGetProductDetails = async () => {
  return MockProductDetailsResponse;
};

export const downloadProductSummariesExcel: typeof originalDownloadProductSummariesExcel = async () => {
  return new Blob(['mock excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const exportAll: typeof originalExportAll = async () => {
  return 'Export completed successfully';
};

export const uploadFromS3: typeof originalUploadFromS3 = async () => {
  return 'Upload from S3 completed successfully';
};

export const uploadProductExtraInfo: typeof originalUploadProductExtraInfo = async () => {
  return Promise.resolve();
};

export const createProductExtraInfo: typeof originalCreateProductExtraInfo = async () => {
  return Promise.resolve();
};

export const updateProductExtraInfo: typeof originalUpdateProductExtraInfo = async () => {
  return Promise.resolve();
};

export const updateProductExtraInfo_1: typeof originalUpdateProductExtraInfo1 = async () => {
  return Promise.resolve();
};

export const getExpenseReportList: typeof originalGetExpenseReportList = async () => {
  return {
    totalElements: MockExpenseReportResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockExpenseReportResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockExpenseReportResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const downloadExpenseReportListExcel: typeof originalDownloadExpenseReportListExcel = async () => {
  return new Blob(['mock excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const createSampleProvideReport: typeof originalCreateSampleProvideReport = async () => {
  return Promise.resolve();
};

export const getSampleProvideReport: typeof originalGetSampleProvideReport = async () => {
  return MockSampleProvideReportDetailResponse;
};

export const updateSampleProvideReport: typeof originalUpdateSampleProvideReport = async () => {
  return Promise.resolve();
};

export const createProductBriefingSingleReport: typeof originalCreateProductBriefingSingleReport = async () => {
  return Promise.resolve();
};

export const getProductBriefingSingleReport: typeof originalGetProductBriefingSingleReport = async () => {
  return MockProductBriefingSingleDetailResponse;
};

export const updateProductBriefingSingleReport: typeof originalUpdateProductBriefingSingleReport = async () => {
  return Promise.resolve();
};

export const createProductBriefingMultiReport: typeof originalCreateProductBriefingMultiReport = async () => {
  return Promise.resolve();
};

export const getProductBriefingMultiReport: typeof originalGetProductBriefingMultiReport = async () => {
  return MockProductBriefingMultiDetailResponse;
};

export const updateProductBriefingMultiReport: typeof originalUpdateProductBriefingMultiReport = async () => {
  return Promise.resolve();
};

export const login: typeof originalLogin = async () => {
  return {
    accessToken: '',
    refreshToken: '',
  };
};

export const refreshToken: typeof originalRefreshToken = async () => {
  return {
    accessToken: '',
    refreshToken: '',
  };
};

export const getPublicKey: typeof originalGetPublicKey = async () => {
  return {
    publicKey: '',
  };
};
export const whoAmI: typeof originalWhoAmI = async () => {
  return {
    id: 1001,
    userId: 'super',
    name: '관리자1',
    gender: 'MALE',
    phoneNumber: '010-1234-5678',
    birthDate: '2025-06-13',
    email: 'super@example.com',
    partnerContractStatus: 'INDIVIDUAL',
    marketingAgreements: {
      sms: true,
      email: true,
      push: true,
    },
    referralCode: 'i95MWCDu',
    csoCertUrl: null,
    registrationDate: '2025-06-13T21:19:02.409834',
    lastLoginDate: '2025-08-04T15:05:50.316059',
    note: null,
    role: 'SUPER_ADMIN',
  };
};

export const verifyCode: typeof originalVerifyCode = async () => {
  return true;
};

export const sendVerificationCode: typeof originalSendVerificationCode = async () => {
  return 'Verification code sent successfully';
};

export const getHospitals: typeof originalGetHospitals = async () => {
  return {
    totalElements: MockHospitalResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockHospitalResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockHospitalResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const uploadHospitalExcel: typeof originalUploadHospitalExcel = async () => {
  return 'Hospital data uploaded successfully';
};

export const softDeleteHospital: typeof originalSoftDeleteHospital = async () => {
  return Promise.resolve();
};

export const getCommentMembers: typeof originalGetCommentMembers = async () => {
  return {
    totalElements: MockCommentMemberResponse.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 1,
    content: MockCommentMemberResponse,
    number: 1,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: MockCommentMemberResponse.length,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 1,
      pageNumber: 1,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const updateComment: typeof originalUpdateComment = async () => {
  return 'Comment updated successfully';
};

export const toggleBlindStatus: typeof originalToggleBlindStatus = async () => {
  return true;
};

export const createComment: typeof originalCreateComment = async () => {
  return 'MockCommentId001';
};

export const toggleLike: typeof originalToggleLike = async () => {
  return Promise.resolve();
};

export const deleteComment: typeof originalDeleteComment = async () => {
  return Promise.resolve();
};

export const createReport: typeof originalCreateReport = async () => {
  return 'MockReportId001';
};

export const testPush: typeof originalTestPush = async () => {
  return Promise.resolve();
};

export const testEmail: typeof originalTestEmail = async () => {
  return Promise.resolve();
};

export const getTermsByVersion: typeof originalGetTermsByVersion = async () => {
  return 'Mock Terms Content for version';
};

export const getPrivacyPolicyByVersion: typeof originalGetPrivacyPolicyByVersion = async () => {
  return 'Mock Privacy Policy Content for version';
};

export const getLatestPrivacyPolicy: typeof originalGetLatestPrivacyPolicy = async () => {
  return 'Mock Latest Privacy Policy Content';
};

export const getLatestTerms: typeof originalGetLatestTerms = async () => {
  return 'Mock Latest Terms Content';
};

export const downloadProductApplicantsExcel: typeof originalDownloadProductApplicantsExcel = async () => {
  return new Blob(['mock excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const downloadSalesAgencyProductsExcel: typeof originalDownloadSalesAgencyProductsExcel = async () => {
  return new Blob(['mock excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const uploadSettlementExcel: typeof originalUploadSettlementExcel = async () => {
  return Promise.resolve();
};

export const getSettlements: typeof originalGetSettlements = async () => {
  return {
    totalElements: MockSettlementResponse.length,
    totalPages: Math.ceil(MockSettlementResponse.length / 10),
    first: true,
    last: false,
    size: 10,
    content: MockSettlementResponse.slice(0, 10),
    number: 0,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: 10,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 10,
      pageNumber: 0,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const getPerformanceStats: typeof originalGetPerformanceStats = async () => {
  return {
    totalElements: MockPerformanceStatsResponse.length,
    totalPages: Math.ceil(MockPerformanceStatsResponse.length / 10),
    first: true,
    last: false,
    size: 10,
    content: MockPerformanceStatsResponse.slice(0, 10),
    number: 0,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: 10,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 10,
      pageNumber: 0,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const downloadPerformanceExcel: typeof originalDownloadPerformanceExcel = async () => {
  return new Blob(['mock performance excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const getSettlementPartnerSummary: typeof originalGetSettlementPartnerSummary = async () => {
  return {
    totalElements: MockSettlementPartnerResponse.length,
    totalPages: Math.ceil(MockSettlementPartnerResponse.length / 10),
    first: true,
    last: false,
    size: 10,
    content: MockSettlementPartnerResponse.slice(0, 10),
    number: 0,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true,
    },
    numberOfElements: 10,
    pageable: {
      offset: 0,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true,
      },
      pageSize: 10,
      pageNumber: 0,
      paged: true,
      unpaged: false,
    },
    empty: false,
  };
};

export const getSettlementPartnerProducts: typeof originalGetSettlementPartnerProducts = async () => {
  return MockSettlementPartnerProductResponse;
};

export const downloadSettlementPartnerSummaryExcel: typeof originalDownloadSettlementPartnerSummaryExcel = async () => {
  return new Blob(['mock settlement partner summary excel data'], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

export const downloadSettlementListExcel: typeof originalDownloadSettlementListExcel = async () => {
  return new Blob(['mock settlement list excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};
