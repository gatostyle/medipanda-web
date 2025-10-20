/* eslint-disable @typescript-eslint/no-empty-object-type */
import axios from '@/utils/axios';

export class DateTimeString extends String {
  public constructor(value: string | Date) {
    if (value instanceof Date) {
      value = value.toISOString();
    }

    super(value);
  }
}

export class DateString extends String {
  public constructor(value: string | Date) {
    if (value instanceof Date) {
      value = value.toISOString().split('T')[0];
    }

    super(value);
  }
}

export interface AdminCreateRequest {
  email: string;
  name: string;
  password: string;
  permissions: (
    | 'MEMBER_MANAGEMENT'
    | 'PRODUCT_MANAGEMENT'
    | 'TRANSACTION_MANAGEMENT'
    | 'CONTRACT_MANAGEMENT'
    | 'PRESCRIPTION_MANAGEMENT'
    | 'SETTLEMENT_MANAGEMENT'
    | 'EXPENSE_REPORT_MANAGEMENT'
    | 'COMMUNITY_MANAGEMENT'
    | 'CONTENT_MANAGEMENT'
    | 'CUSTOMER_SERVICE'
    | 'BANNER_MANAGEMENT'
    | 'PERMISSION_MANAGEMENT'
    | 'ALL'
  )[];
  phoneNumber: string;
  status: boolean;
  userId: string;
}

export interface AdminPermissionResponse {
  permissions: (
    | 'MEMBER_MANAGEMENT'
    | 'PRODUCT_MANAGEMENT'
    | 'TRANSACTION_MANAGEMENT'
    | 'CONTRACT_MANAGEMENT'
    | 'PRESCRIPTION_MANAGEMENT'
    | 'SETTLEMENT_MANAGEMENT'
    | 'EXPENSE_REPORT_MANAGEMENT'
    | 'COMMUNITY_MANAGEMENT'
    | 'CONTENT_MANAGEMENT'
    | 'CUSTOMER_SERVICE'
    | 'BANNER_MANAGEMENT'
    | 'PERMISSION_MANAGEMENT'
    | 'ALL'
  )[];
}

export interface AdminUpdateRequest {
  email: string | null;
  name: string | null;
  password: string | null;
  permissions:
    | (
        | 'MEMBER_MANAGEMENT'
        | 'PRODUCT_MANAGEMENT'
        | 'TRANSACTION_MANAGEMENT'
        | 'CONTRACT_MANAGEMENT'
        | 'PRESCRIPTION_MANAGEMENT'
        | 'SETTLEMENT_MANAGEMENT'
        | 'EXPENSE_REPORT_MANAGEMENT'
        | 'COMMUNITY_MANAGEMENT'
        | 'CONTENT_MANAGEMENT'
        | 'CUSTOMER_SERVICE'
        | 'BANNER_MANAGEMENT'
        | 'PERMISSION_MANAGEMENT'
        | 'ALL'
      )[]
    | null;
  phoneNumber: string | null;
  userId: string | null;
}

export interface AlternativeProductDto {
  composition: string | null;
  feeRate: number | null;
  insurance: string | null;
  kdCode: string;
  manufacturer: string | null;
  nhiPrice: number | null;
  nhiUnit: string | null;
  note: string | null;
  price: number | null;
  productId: number;
  productName: string;
  substituent: string | null;
}

export interface AttachmentResponse {
  fileUrl: string;
  originalFileName: string;
  s3fileId: number;
  type: 'ATTACHMENT' | 'EDITOR';
}

export interface BannerCreateRequest {
  displayOrder: number;
  endAt: DateTimeString;
  linkUrl: string;
  position: 'ALL' | 'POPUP' | 'PC_MAIN' | 'PC_COMMUNITY' | 'MOBILE_MAIN';
  scope: 'ENTIRE' | 'CONTRACT' | 'NON_CONTRACT';
  startAt: DateTimeString;
  status: 'VISIBLE' | 'HIDDEN';
  title: string;
}

export interface BannerResponse {
  clickCount: number;
  ctr: number;
  displayOrder: number;
  endAt: string;
  id: number;
  imageUrl: string;
  linkUrl: string;
  note: string | null;
  position: 'ALL' | 'POPUP' | 'PC_MAIN' | 'PC_COMMUNITY' | 'MOBILE_MAIN';
  scope: 'ENTIRE' | 'CONTRACT' | 'NON_CONTRACT';
  startAt: string;
  status: 'VISIBLE' | 'HIDDEN';
  title: string;
  viewCount: number;
}

export interface BannerUpdateRequest {
  displayOrder: number | null;
  endAt: DateTimeString | null;
  linkUrl: string | null;
  position: ('ALL' | 'POPUP' | 'PC_MAIN' | 'PC_COMMUNITY' | 'MOBILE_MAIN') | null;
  scope: ('ENTIRE' | 'CONTRACT' | 'NON_CONTRACT') | null;
  startAt: DateTimeString | null;
  status: ('VISIBLE' | 'HIDDEN') | null;
  title: string | null;
}

export interface BlindPostResponse {
  blindAt: string;
  content: string;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  id: number;
  likesCount: number;
  memberName: string;
  nickname: string;
  postType: 'BOARD' | 'COMMENT';
  reportType: 'SPAM' | 'ABUSE' | 'ILLEGAL_CONTENT' | 'PERSONAL_INFORMATION' | 'OTHER';
  userId: string;
}

export interface BlindUpdateRequest {
  commentId: number | null;
  postId: number | null;
}

export interface BlockResponse {
  blockedAt: string;
  blockedUserId: string;
}

export interface BoardDetailsResponse {
  attachments: AttachmentResponse[];
  boardType: string;
  children: BoardDetailsResponse[];
  commentCount: number;
  comments: CommentResponse[];
  content: string;
  createdAt: string;
  exposureRange: 'ALL' | 'CONTRACTED' | 'UNCONTRACTED';
  hiddenNickname: boolean;
  id: number;
  isBlind: boolean;
  isExposed: boolean;
  likedByMe: boolean;
  likesCount: number;
  memberType: 'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION';
  name: string;
  nickname: string;
  noticeProperties: NoticeProperties | null;
  reportedByMe: boolean;
  reports: BoardReportResponse[];
  title: string;
  userId: string;
  viewsCount: number;
}

export interface BoardMemberStatsResponse {
  blindPostCount: number;
  commentCount: number;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  id: number;
  name: string;
  nickname: string;
  phoneNumber: string;
  postCount: number;
  totalLikes: number;
  userId: string;
}

export interface BoardPostCreateRequest {
  boardType: 'ANONYMOUS' | 'MR_CSO_MATCHING' | 'NOTICE' | 'INQUIRY' | 'FAQ' | 'CSO_A_TO_Z' | 'EVENT' | 'SALES_AGENCY' | 'PRODUCT';
  content: string;
  editorFileIds: number[] | null;
  exposureRange: 'ALL' | 'CONTRACTED' | 'UNCONTRACTED';
  hiddenNickname: boolean;
  isExposed: boolean;
  nickname: string;
  noticeProperties: NoticeProperties | null;
  parentId: number | null;
  title: string;
  userId: string;
}

export interface BoardPostResponse {
  boardType: 'ANONYMOUS' | 'MR_CSO_MATCHING' | 'NOTICE' | 'INQUIRY' | 'FAQ' | 'CSO_A_TO_Z' | 'EVENT' | 'SALES_AGENCY' | 'PRODUCT';
  commentCount: number;
  createdAt: string;
  exposureRange: 'ALL' | 'CONTRACTED' | 'UNCONTRACTED';
  hasChildren: boolean;
  hiddenNickname: boolean;
  id: number;
  isBlind: boolean;
  isExposed: boolean;
  likesCount: number;
  memberId: number;
  memberType: 'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION';
  name: string;
  nickname: string;
  noticeProperties: NoticeProperties | null;
  noticeType:
    | ('PRODUCT_STATUS' | 'MANUFACTURING_SUSPENSION' | 'NEW_PRODUCT' | 'POLICY' | 'GENERAL' | 'ANONYMOUS_BOARD' | 'MR_CSO_MATCHING')
    | null;
  title: string;
  userId: string;
  viewedByMe: boolean;
  viewsCount: number;
}

export interface BoardPostUpdateRequest {
  content: string | null;
  editorFileIds: number[] | null;
  exposureRange: ('ALL' | 'CONTRACTED' | 'UNCONTRACTED') | null;
  hiddenNickname: boolean | null;
  isBlind: boolean | null;
  isExposed: boolean | null;
  keepFileIds: number[];
  noticeProperties: UpdateNoticeProperties | null;
  title: string | null;
}

export interface BoardReportResponse {
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  id: number;
  memberName: string;
  nickname: string;
  reportContent: string;
  reportDateTime: string;
  reportType: 'SPAM' | 'ABUSE' | 'ILLEGAL_CONTENT' | 'PERSONAL_INFORMATION' | 'OTHER';
  userId: string;
}

export interface ChangePasswordForFindAccountRequest {
  newPassword: string;
  userId: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  userId: string;
}

export interface CommentCreateRequest {
  boardPostId: number;
  content: string;
  parentId: number | null;
}

export interface CommentMemberResponse {
  commentType: 'COMMENT' | 'REPLY';
  content: string;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  createdAt: string;
  id: number;
  isBlind: boolean;
  likesCount: number;
  name: string;
  nickname: string;
  userId: string;
}

export interface CommentResponse {
  content: string;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  createdAt: string;
  id: number;
  isBlind: boolean;
  likedByMe: boolean;
  likesCount: number;
  modifiedAt: string;
  name: string;
  nickname: string;
  parentId: number | null;
  reportedByMe: boolean;
  userId: string;
  visible: boolean;
}

export interface CommentUpdateRequest {
  content: string;
  id: number;
}

export interface DealerCreateRequest {
  accountNumber: string | null;
  bankName: string | null;
  dealerName: string;
  drugCompanyIds: number[];
}

export interface DealerResponse {
  createdAt: string;
  dealerName: string;
  displayName: string;
  drugCompanyId: number | null;
  drugCompanyName: string | null;
  id: number;
}

export interface DeviceRequest {
  appVersion: string | null;
  deviceUuid: string | null;
  fcmToken: string | null;
  platform: 'android' | 'ios' | 'other';
}

export interface DiffDouble {
  after: number;
  before: number;
}

export interface DiffInteger {
  after: number;
  before: number;
}

export interface DrugCompanyResponse {
  code: string;
  id: number;
  name: string;
}

export interface EventBoardCreateRequest {
  description: string;
  endAt: string;
  note: string | null;
  startAt: string;
  videoUrl: string | null;
}

export interface EventBoardDetailsResponse {
  boardPostDetail: BoardDetailsResponse;
  description: string;
  eventEndDate: string;
  eventId: number;
  eventStartDate: string;
  note: string | null;
  thumbnailUrl: string;
  videoUrl: string | null;
}

export interface EventBoardSummaryResponse {
  createdDate: string;
  description: string;
  eventEndAt: string;
  eventStartAt: string;
  eventStatus: 'IN_PROGRESS' | 'FINISHED';
  id: number;
  isExposed: boolean;
  thumbnailUrl: string;
  title: string;
  viewCount: number;
}

export interface EventBoardUpdateRequest {
  description: string | null;
  endAt: string | null;
  note: string | null;
  startAt: string | null;
  videoUrl: string | null;
}

export interface ExpenseReportResponse {
  companyName: string | null;
  eventEndAt: string | null;
  eventStartAt: string | null;
  institutionType: string;
  productCode: string | null;
  productId: number | null;
  productName: string | null;
  reportId: number;
  reportType: 'SAMPLE_PROVIDE' | 'PRODUCT_BRIEFING_MULTI' | 'PRODUCT_BRIEFING_SINGLE';
  status: 'PENDING' | 'COMPLETED';
  supportAmount: number;
  userId: string | null;
}

export interface FcmTokenRequest {
  deviceUuid: string | null;
  fcmToken: string;
  platform: 'android' | 'ios' | 'other';
}

export interface FileValidationErrorDto {
  error:
    | 'INVALID_EXTENSION'
    | 'INVALID_FILENAME_FORMAT'
    | 'DEALER_NOT_FOUND'
    | 'PARTNER_NOT_FOUND'
    | 'DRUG_COMPANY_NOT_FOUND'
    | 'INVALID_MONTH_FORMAT'
    | 'DUPLICATE_DEALER_PARTNER_DRUG_COMPANY'
    | 'DRUG_COMPANY_MISMATCH';
  fileName: string;
  message: string;
}

export interface HospitalResponse {
  address: string;
  id: number;
  name: string;
  scheduledOpenDate: string | null;
  sido: string | null;
  sigungu: string | null;
  source: string | null;
}

export interface InstitutionInfo {
  code: string;
  name: string;
}

export interface Item {
  baseFeeRate: number | null;
  feeAmount: number | null;
  id: number | null;
  note: string | null;
  ocrItem: OcrOriginalItem | null;
  productCode: string | null;
  quantity: number | null;
  totalPrice: number | null;
  unit: string | null;
  unitPrice: number | null;
}

export interface KmcAuthRequest {
  certMet: string;
  cpId: string;
  plusInfo: string;
  urlCode: string;
}

export interface KmcAuthResponse {
  certNum: string;
  requestedAt: string;
  trCert: string;
}

export interface LoginRequest {
  device: DeviceRequest | null;
  password: string;
  userId: string;
}

export interface LoginResponse {
  accessToken: string;
  deviceUuid: string | null;
  refreshToken: string;
}

export interface MarketingAgreements {
  email: boolean;
  emailAgreedAt: string | null;
  push: boolean;
  pushAgreedAt: string | null;
  sms: boolean;
  smsAgreedAt: string | null;
}

export interface MedicalPersonInfo {
  name: string;
}

export interface MedicalPersonWithSignature {
  name: string;
  signatureFile: AttachmentResponse;
}

export interface MemberDetailsResponse {
  accountStatus: 'ACTIVATED' | 'BLOCKED' | 'DELETED';
  birthDate: string;
  contractDate: string | null;
  contractStatus: ('PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED') | null;
  csoCertUrl: string | null;
  email: string;
  gender: ('MALE' | 'FEMALE') | null;
  id: number;
  lastLoginDate: string;
  marketingAgreements: MarketingAgreements;
  name: string;
  nickname: string;
  nicknameHidden: boolean;
  note: string | null;
  partnerContractStatus: 'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION';
  phoneNumber: string;
  referralCode: string | null;
  registrationDate: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  userId: string;
}

export interface MemberResponse {
  accountStatus: 'ACTIVATED' | 'BLOCKED' | 'DELETED';
  birthDate: string;
  companyName: string | null;
  createdAt: string;
  email: string;
  hasCsoCert: boolean;
  id: number;
  lastLoginDate: string;
  marketingConsent: boolean;
  name: string;
  nickname: string;
  nicknameHidden: boolean;
  partnerContractStatus: 'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION';
  phoneNumber: string;
  registrationDate: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  userId: string;
}

export interface MemberSignupRequest {
  birthDate: string;
  email: string;
  gender: 'MALE' | 'FEMALE';
  marketingAgreement: MarketingAgreements;
  name: string;
  nickname: string | null;
  password: string;
  phoneNumber: string;
  referralCode: string | null;
  userId: string;
}

export interface MemberUpdateRequest {
  accountStatus: ('ACTIVATED' | 'BLOCKED' | 'DELETED') | null;
  birthDate: string | null;
  email: string | null;
  marketingAgreement: MarketingAgreements | null;
  name: string | null;
  nickname: string | null;
  note: string | null;
  password: string | null;
  phoneNumber: string | null;
  referralCode: string | null;
}

export interface MonthlyPrescriptionCountResponse {
  count: number;
  month: number;
}

export interface MonthlyTotalAmountResponse {
  feeAmount: number;
  month: number;
}

export interface NicknameCheckRequest {
  nickname: string;
}

export interface NicknameCheckResponse {
  available: boolean;
  changedAt: string | null;
  duplicated: boolean;
  recentlyChanged: boolean;
}

export interface NicknameUpdateRequest {
  nickname: string;
}

export interface NoteUpdateItem {
  note: string | null;
  userId: string;
}

export interface NoticeProperties {
  drugCompany: string | null;
  fixedTop: boolean;
  noticeType: 'PRODUCT_STATUS' | 'MANUFACTURING_SUSPENSION' | 'NEW_PRODUCT' | 'POLICY' | 'GENERAL' | 'ANONYMOUS_BOARD' | 'MR_CSO_MATCHING';
}

export interface OcrOriginalDiffRowResponse {
  baseFeeRate: DiffDouble;
  feeAmount: DiffInteger;
  productCode: string;
  productName: string;
  quantity: DiffInteger;
  settlementMonth: string;
  totalAmount: DiffInteger;
}

export interface OcrOriginalItem {
  baseFeeRate: number;
  feeAmount: number;
  note: string | null;
  productCode: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  unit: string;
  unitPrice: number;
}

export interface PageBannerResponse {
  content: BannerResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageBlindPostResponse {
  content: BlindPostResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageBoardMemberStatsResponse {
  content: BoardMemberStatsResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageBoardPostResponse {
  content: BoardPostResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageCommentMemberResponse {
  content: CommentMemberResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageEventBoardSummaryResponse {
  content: EventBoardSummaryResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageExpenseReportResponse {
  content: ExpenseReportResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageHospitalResponse {
  content: HospitalResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageMemberResponse {
  content: MemberResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PagePartnerResponse {
  content: PartnerResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PagePerformanceStatsResponse {
  content: PerformanceStatsResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PagePrescriptionPartnerResponse {
  content: PrescriptionPartnerResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PagePrescriptionResponse {
  content: PrescriptionResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageProductSummaryResponse {
  content: ProductSummaryResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageSalesAgencyProductApplicantResponse {
  content: SalesAgencyProductApplicantResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageSalesAgencyProductSummaryResponse {
  content: SalesAgencyProductSummaryResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageSettlementPartnerResponse {
  content: SettlementPartnerResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageSettlementResponse {
  content: SettlementResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  sort: SortObject;
  totalElements: number;
  totalPages: number;
}

export interface PageableObject {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: SortObject;
  unpaged: boolean;
}

export interface PartnerContractDetailsResponse {
  accountNumber: string;
  bankName: string;
  businessNumber: string;
  companyName: string;
  contractDate: string;
  contractType: 'INDIVIDUAL' | 'ORGANIZATION';
  fileUrls: Record<string, string>;
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
}

export interface PartnerContractRequest {
  accountNumber: string;
  bankName: string;
  businessNumber: string;
  companyName: string;
  contractType: 'INDIVIDUAL' | 'ORGANIZATION';
}

export interface PartnerContractUpdateRequest {
  accountNumber: string | null;
  bankName: string | null;
  businessNumber: string | null;
  companyName: string | null;
  contractType: ('INDIVIDUAL' | 'ORGANIZATION') | null;
}

export interface PartnerCreateRequest {
  businessNumber: string;
  companyName: string;
  contractType: 'CONTRACT' | 'NON_CONTRACT';
  drugCompany: string;
  drugCompanyId: number;
  institutionCode: string;
  institutionName: string;
  medicalDepartment: string | null;
  note: string | null;
  pharmacyAddress: string | null;
  pharmacyName: string | null;
  pharmacyStatus: 'NORMAL' | 'CLOSED' | 'DELETED' | 'NONE';
  userId: string;
}

export interface PartnerResponse {
  businessNumber: string;
  companyName: string;
  contractType: 'CONTRACT' | 'NON_CONTRACT';
  drugCompanyName: string;
  hasPharmacy: boolean;
  id: number;
  institutionCode: string;
  institutionName: string;
  medicalDepartment: string | null;
  memberName: string;
  memberType: 'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION';
  note: string | null;
  pharmacyAddress: string | null;
  pharmacyName: string | null;
  pharmacyStatus: ('NORMAL' | 'CLOSED' | 'DELETED' | 'NONE') | null;
}

export interface PartnerUpdateRequest {
  businessNumber: string | null;
  companyName: string | null;
  contractType: ('CONTRACT' | 'NON_CONTRACT') | null;
  drugCompanyId: number | null;
  drugCompanyName: string | null;
  institutionCode: string | null;
  institutionName: string | null;
  medicalDepartment: string | null;
  note: string | null;
  pharmacyAddress: string | null;
  pharmacyName: string | null;
  pharmacyStatus: ('NORMAL' | 'CLOSED' | 'DELETED' | 'NONE') | null;
}

export interface PerformanceStatsByDrugCompany {
  drugCompany: string | null;
  feeAmount: number;
  prescriptionAmount: number;
  totalAmount: number;
}

export interface PerformanceStatsByDrugCompanyMonthly {
  drugCompany: string;
  feeAmount: number;
  prescriptionAmount: number;
  settlementMonth: string;
  totalAmount: number;
}

export interface PerformanceStatsByInstitution {
  feeAmount: number;
  institutionCode: string | null;
  institutionName: string | null;
  prescriptionAmount: number;
  totalAmount: number;
}

export interface PerformanceStatsResponse {
  companyName: string | null;
  dealerName: string | null;
  drugCompany: string;
  feeAmount: number;
  institutionCode: string | null;
  institutionName: string | null;
  partnerId: number;
  prescriptionAmount: number;
  settlementMonth: string;
  totalAmount: number;
}

export interface PrescriptionCreateRequest {
  dealerId: number;
  drugCompanyId: number;
  partnerId: number;
  prescriptionMonth: DateTimeString;
  settlementMonth: DateTimeString;
}

export interface PrescriptionPartnerProductCreateRequest {
  items: PrescriptionProductItem[];
  prescriptionPartnerId: number;
}

export interface PrescriptionPartnerProductResponse {
  baseFeeRate: number;
  feeAmount: number;
  id: number;
  note: string | null;
  productCode: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  unit: string;
  unitPrice: number;
}

export interface PrescriptionPartnerProductUpsertRequest {
  deletedPrescriptionPartnerProductIds: number[];
  items: Item[];
}

export interface PrescriptionPartnerResponse {
  amount: number;
  businessNumber: string;
  companyName: string;
  dealerId: number;
  dealerName: string;
  drugCompany: string;
  drugCompanyCode: string;
  drugCompanyId: number;
  ediFiles: AttachmentResponse[];
  id: number;
  inputDate: string;
  institutionCode: string;
  institutionName: string;
  partnerId: number;
  partnerName: string;
  prescriptionMonth: string;
  settlementMonth: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface PrescriptionProductItem {
  baseFeeRate: number;
  feeAmount: number;
  note: string | null;
  ocrItem: OcrOriginalItem | null;
  productCode: string;
  quantity: number;
  totalPrice: number;
  unit: string;
  unitPrice: number;
}

export interface PrescriptionResponse {
  checkedAt: string | null;
  companyName: string;
  dealerId: number;
  dealerName: string;
  drugCompanyName: string;
  id: number;
  institutionName: string;
  prescriptionMonth: string;
  settlementMonth: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  submittedAt: string;
  type: string;
  userId: string;
}

export interface PrescriptionUpdateRequest {
  dealerId: number | null;
  drugCompanyId: number | null;
  keepFileIds: number[] | null;
  partnerId: number | null;
  prescriptionMonth: DateTimeString | null;
  prescriptionPartnerId: number;
}

export interface PrescriptionZipUploadResult {
  createdEdiFileCount: number;
  createdPrescriptionPartnerCount: number;
  errors: FileValidationErrorDto[];
  success: boolean;
}

export interface ProductBriefingMultiCreateRequest {
  accommodationFee: number;
  endedAt: DateTimeString;
  giftFee: number;
  institutions: InstitutionInfo[];
  isJoint: boolean;
  location: string;
  mealFee: number;
  productId: number;
  startedAt: DateTimeString;
  transportationFee: number;
}

export interface ProductBriefingMultiDetailResponse {
  accommodationFee: number;
  attachedFiles: AttachmentResponse[];
  endedAt: string;
  giftFee: number;
  institutions: InstitutionInfo[];
  isJoint: boolean;
  location: string;
  mealFee: number;
  productCode: string;
  productId: number;
  productName: string;
  reportId: number;
  reportType: 'SAMPLE_PROVIDE' | 'PRODUCT_BRIEFING_MULTI' | 'PRODUCT_BRIEFING_SINGLE';
  startedAt: string;
  status: 'PENDING' | 'COMPLETED';
  transportationFee: number;
}

export interface ProductBriefingMultiUpdateRequest {
  accommodationFee: number | null;
  endedAt: DateTimeString | null;
  existFileIds: number[];
  giftFee: number | null;
  institutions: InstitutionInfo[] | null;
  isJoint: boolean | null;
  location: string | null;
  mealFee: number | null;
  productId: number | null;
  startedAt: DateTimeString | null;
  transportationFee: number | null;
}

export interface ProductBriefingSingleCreateRequest {
  eventAt: DateTimeString;
  institutionCode: string;
  institutionName: string;
  isJoint: boolean;
  location: string;
  medicalPersons: MedicalPersonInfo[] | null;
  productId: number;
  supportAmount: number;
}

export interface ProductBriefingSingleDetailResponse {
  attachedFiles: AttachmentResponse[];
  eventAt: string;
  institutionCode: string;
  institutionName: string;
  isJoint: boolean;
  location: string;
  medicalPersons: MedicalPersonWithSignature[];
  productCode: string;
  productId: number;
  productName: string;
  reportId: number;
  status: 'PENDING' | 'COMPLETED';
  supportAmount: number;
}

export interface ProductBriefingSingleUpdateRequest {
  eventAt: DateTimeString | null;
  existFileIds: number[];
  institutionCode: string | null;
  institutionName: string | null;
  isJoint: boolean | null;
  location: string | null;
  medicalPersons: MedicalPersonInfo[] | null;
  productId: number | null;
  supportAmount: number | null;
}

export interface ProductDetailsResponse {
  alternativeProducts: AlternativeProductDto[];
  boardDetailsResponse: BoardDetailsResponse;
  changedFeeRate: number | null;
  changedMonth: string | null;
  composition: string | null;
  feeRate: number | null;
  insurance: string | null;
  isAcquisition: boolean | null;
  isOutOfStock: boolean | null;
  isPromotion: boolean | null;
  isStopSelling: boolean | null;
  manufacturer: string | null;
  note: string | null;
  price: number | null;
  priceUnit: 'KRW' | 'USD' | 'EUR';
  productCode: string | null;
  productName: string | null;
  roundedChangedFeeRate: number | null;
  roundedFeeRate: number | null;
}

export interface ProductExtraInfoRequest {
  changedFeeRate: string | null;
  changedMonth: number | null;
  composition: string | null;
  detailInfo: string | null;
  feeRate: string | null;
  isAcquisition: boolean | null;
  isOutOfStock: boolean | null;
  isPromotion: boolean | null;
  isStopSelling: boolean | null;
  manufacturer: string | null;
  note: string | null;
  price: number | null;
  priceUnit: 'KRW' | 'USD' | 'EUR';
  productCode: string;
  productName: string | null;
}

export interface ProductSummaryResponse {
  changedFeeRate: number | null;
  changedMonth: string | null;
  composition: string | null;
  feeRate: number | null;
  id: number;
  insurance: string | null;
  isAcquisition: boolean | null;
  isOutOfStock: boolean | null;
  isPromotion: boolean | null;
  isStopSelling: boolean | null;
  manufacturerName: string | null;
  note: string | null;
  price: number | null;
  productCode: string;
  productName: string | null;
  roundedChangedFeeRate: number | null;
  roundedFeeRate: number | null;
}

export interface PushPreferenceResponse {
  allowCommunity: boolean;
  allowNotice: boolean;
  allowPrescription: boolean;
  allowSalesAgency: boolean;
  allowSettlement: boolean;
}

export interface PushPreferenceUpdateRequest {
  allowCommunity: boolean | null;
  allowNotice: boolean | null;
  allowPrescription: boolean | null;
  allowSalesAgency: boolean | null;
  allowSettlement: boolean | null;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  userId: string;
}

export interface RegionCategoryResponse {
  id: number;
  name: string;
}

export interface ReportCreateRequest {
  commentId: number | null;
  postId: number | null;
  reportContent: string;
  reportType: 'SPAM' | 'ABUSE' | 'ILLEGAL_CONTENT' | 'PERSONAL_INFORMATION' | 'OTHER';
}

export interface SalesAgencyProductApplicantResponse {
  appliedDate: string;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  id: number;
  memberName: string;
  note: string | null;
  phoneNumber: string;
  userId: string;
}

export interface SalesAgencyProductCreateRequest {
  clientName: string;
  contractDate: string;
  endAt: string;
  note: string | null;
  productName: string;
  quantity: number;
  startAt: string;
  videoUrl: string | null;
}

export interface SalesAgencyProductDetailsResponse {
  applied: boolean;
  boardPostDetail: BoardDetailsResponse;
  clientName: string;
  contractDate: string;
  endDate: string;
  note: string | null;
  price: number;
  productId: number;
  productName: string;
  quantity: number;
  startDate: string;
  thumbnailUrl: string;
  videoUrl: string | null;
}

export interface SalesAgencyProductNoteUpdateRequest {
  productId: number;
  updates: NoteUpdateItem[];
}

export interface SalesAgencyProductSummaryResponse {
  appliedCount: number;
  clientName: string;
  contractDate: string;
  endAt: string;
  id: number;
  isExposed: boolean;
  price: number;
  productName: string;
  quantity: number;
  startAt: string;
  thumbnailUrl: string | null;
}

export interface SalesAgencyProductUpdateRequest {
  clientName: string | null;
  contractDate: string | null;
  endAt: string | null;
  note: string | null;
  productName: string | null;
  quantity: number | null;
  startAt: string | null;
  videoUrl: string | null;
}

export interface SampleProvideReportCreateRequest {
  institutionCode: string;
  institutionName: string;
  packCount: number;
  productId: number;
  provideCount: number;
  providedAt: DateTimeString;
}

export interface SampleProvideReportDetailResponse {
  attachedFiles: AttachmentResponse[];
  institutionCode: string;
  institutionName: string;
  packCount: number;
  productCode: string;
  productId: number;
  productName: string;
  provideCount: number;
  providedAt: string;
  reportId: number;
  reportType: 'SAMPLE_PROVIDE' | 'PRODUCT_BRIEFING_MULTI' | 'PRODUCT_BRIEFING_SINGLE';
  status: 'PENDING' | 'COMPLETED';
}

export interface SampleProvideReportUpdateRequest {
  existFileIds: number[];
  institutionCode: string | null;
  institutionName: string | null;
  packCount: number | null;
  productId: number | null;
  provideCount: number | null;
  providedAt: DateTimeString | null;
}

export interface SettlementNotifyRequest {
  settlementIds: number[];
}

export interface SettlementPartnerProductResponse {
  extraFeeAmount: number | null;
  extraFeeRate: number | null;
  feeAmount: number | null;
  feeRate: number | null;
  id: number;
  note: string | null;
  prescriptionAmount: number | null;
  productCode: string | null;
  productName: string | null;
  quantity: number | null;
  seq: number | null;
  unitPrice: number | null;
}

export interface SettlementPartnerResponse {
  businessNumber: string;
  companyName: string;
  dealerName: string;
  institutionCode: string;
  institutionName: string;
  settlementPartnerId: number;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface SettlementResponse {
  companyName: string | null;
  dealerId: number;
  dealerName: string;
  drugCompanyName: string;
  id: number;
  prescriptionAmount: number;
  settlementMonth: string;
  status: ('REQUEST' | 'OBJECTION') | null;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface SortObject {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface UpdateNoticeProperties {
  drugCompany: string | null;
  fixedTop: boolean | null;
  noticeType:
    | ('PRODUCT_STATUS' | 'MANUFACTURING_SUSPENSION' | 'NEW_PRODUCT' | 'POLICY' | 'GENERAL' | 'ANONYMOUS_BOARD' | 'MR_CSO_MATCHING')
    | null;
}

/**
 * FCM 토큰 등록
 * POST /v1/auth/fcm-token
 */
export async function registerFcmToken(data: FcmTokenRequest): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/auth/fcm-token',
    data,
  });
}

/**
 * 로그인
 * POST /v1/auth/login
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await axios.request<LoginResponse>({
    method: 'POST',
    url: '/v1/auth/login',
    data,
  });
  return response.data;
}

/**
 * 로그아웃
 * GET /v1/auth/logout
 */
export async function logout(options?: { deviceUuid?: string }): Promise<void> {
  await axios.request({
    method: 'GET',
    url: '/v1/auth/logout',
    params: options,
  });
}

/**
 * 나다
 * GET /v1/auth/me
 */
export async function whoAmI(): Promise<MemberDetailsResponse> {
  const response = await axios.request<MemberDetailsResponse>({
    method: 'GET',
    url: '/v1/auth/me',
  });
  return response.data;
}

/**
 * 암호화용 공개키
 * GET /v1/auth/public-key
 */
export async function getPublicKey(): Promise<Record<string, string>> {
  const response = await axios.request<Record<string, string>>({
    method: 'GET',
    url: '/v1/auth/public-key',
  });
  return response.data;
}

/**
 * AccessToken 재발급
 * POST /v1/auth/token/refresh
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
  const response = await axios.request<LoginResponse>({
    method: 'POST',
    url: '/v1/auth/token/refresh',
    data,
  });
  return response.data;
}

/**
 * 아이디 비밀번호 찾기용 휴대폰 인증번호 전송
 * POST /v1/auth/verification-code/account/send
 */
export async function sendVerificationCodeForFindAccount(options?: { phoneNumber?: string }): Promise<string> {
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/auth/verification-code/account/send',
    params: options,
  });
  return response.data;
}

/**
 * 아이디 찾기용 휴대폰 인증번호 확인
 * POST /v1/auth/verification-code/id/verify
 */
export async function verifyCodeForFindId(options?: { phoneNumber?: string; verificationCode?: string }): Promise<string> {
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/auth/verification-code/id/verify',
    params: options,
  });
  return response.data;
}

/**
 * 비밀번호 찾기용 휴대폰 인증번호 확인
 * POST /v1/auth/verification-code/password/verify
 */
export async function verifyCodeForFindPassword(options?: {
  userId?: string;
  phoneNumber?: string;
  verificationCode?: string;
}): Promise<LoginResponse> {
  const response = await axios.request<LoginResponse>({
    method: 'POST',
    url: '/v1/auth/verification-code/password/verify',
    params: options,
  });
  return response.data;
}

/**
 * 휴대폰 인증번호 전송
 * POST /v1/auth/verification-code/send/{userId}
 */
export async function sendVerificationCode(
  userId: string,
  options?: {
    phoneNumber?: string;
  },
): Promise<void> {
  await axios.request({
    method: 'POST',
    url: `/v1/auth/verification-code/send/${userId}`,
    params: options,
  });
}

/**
 * 휴대폰 인증번호 확인
 * POST /v1/auth/verification-code/verify/{userId}
 */
export async function verifyCode(
  userId: string,
  options?: {
    verificationCode?: string;
  },
): Promise<boolean> {
  const response = await axios.request<boolean>({
    method: 'POST',
    url: `/v1/auth/verification-code/verify/${userId}`,
    params: options,
  });
  return response.data;
}

/**
 * 배너 목록 조회
 * GET /v1/banners
 */
export async function getBanners(options?: {
  page?: number;
  size?: number;
  isExposed?: boolean;
  bannerPositions?: ('ALL' | 'POPUP' | 'PC_MAIN' | 'PC_COMMUNITY' | 'MOBILE_MAIN')[];
  startAt?: DateTimeString;
  endAt?: DateTimeString;
  bannerTitle?: string;
}): Promise<PageBannerResponse> {
  const response = await axios.request<PageBannerResponse>({
    method: 'GET',
    url: '/v1/banners',
    params: {
      ...options,
      bannerPositions: options?.bannerPositions?.join(','),
    },
  });
  return response.data;
}

/**
 * 배너 생성
 * POST /v1/banners
 */
export async function createBanner(data: { imageFile: File; request: BannerCreateRequest }): Promise<string> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  form.append('imageFile', data.imageFile, data.imageFile.name.normalize('NFC'));
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/banners',
    data: form,
  });
  return response.data;
}

/**
 * 배너 단건 조회
 * GET /v1/banners/{id}
 */
export async function getBanner(id: number): Promise<BannerResponse> {
  const response = await axios.request<BannerResponse>({
    method: 'GET',
    url: `/v1/banners/${id}`,
  });
  return response.data;
}

/**
 * 배너 수정
 * PATCH /v1/banners/{id}
 */
export async function updateBanner(
  id: number,
  data: {
    imageFile?: File;
    request: BannerUpdateRequest;
  },
): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  if (data.imageFile !== undefined) {
    form.append('imageFile', data.imageFile, data.imageFile.name.normalize('NFC'));
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/banners/${id}`,
    data: form,
  });
}

/**
 * 블라인드 게시글, 댓글 목록 조회
 * GET /v1/blind-posts
 */
export async function getBlindPosts(options?: {
  postType?: 'BOARD' | 'COMMENT';
  memberName?: string;
  userId?: string;
  nickname?: string;
  startAt?: DateString;
  endAt?: DateString;
  page?: number;
  size?: number;
}): Promise<PageBlindPostResponse> {
  const response = await axios.request<PageBlindPostResponse>({
    method: 'GET',
    url: '/v1/blind-posts',
    params: options,
  });
  return response.data;
}

/**
 * 블라인드 게시글, 댓글 해제
 * PUT /v1/blind-posts/unblind
 */
export async function unblindPost(data: BlindUpdateRequest): Promise<void> {
  await axios.request({
    method: 'PUT',
    url: '/v1/blind-posts/unblind',
    data,
  });
}

/**
 * 내가 차단한 사용자 목록 조회
 * GET /v1/blocks
 */
export async function list(): Promise<BlockResponse[]> {
  const response = await axios.request<BlockResponse[]>({
    method: 'GET',
    url: '/v1/blocks',
  });
  return response.data;
}

/**
 * 사용자 차단
 * PUT /v1/blocks/{targetUserId}
 */
export async function block(targetUserId: string): Promise<void> {
  await axios.request({
    method: 'PUT',
    url: `/v1/blocks/${targetUserId}`,
  });
}

/**
 * 차단 해제
 * DELETE /v1/blocks/{targetUserId}
 */
export async function unblock(targetUserId: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/blocks/${targetUserId}`,
  });
}

/**
 * 게시판 목록 조회
 * GET /v1/boards
 */
export async function getBoards(options?: {
  page?: number;
  size?: number;
  sortType?: 'LATEST' | 'VIEWS' | 'LIKES' | 'COMMENTS';
  ignoreFixedTop?: boolean;
  boardType?: 'ANONYMOUS' | 'MR_CSO_MATCHING' | 'NOTICE' | 'INQUIRY' | 'FAQ' | 'CSO_A_TO_Z' | 'EVENT' | 'SALES_AGENCY' | 'PRODUCT';
  userId?: string;
  name?: string;
  nickname?: string;
  startAt?: DateString;
  endAt?: DateString;
  filterBlind?: boolean;
  boardTitle?: string;
  filterDeleted?: boolean;
  isExposed?: boolean;
  drugCompany?: string;
  myUserId?: string;
  includeChild?: boolean;
  hasChildren?: boolean;
  noticeTypes?: (
    | 'PRODUCT_STATUS'
    | 'MANUFACTURING_SUSPENSION'
    | 'NEW_PRODUCT'
    | 'POLICY'
    | 'GENERAL'
    | 'ANONYMOUS_BOARD'
    | 'MR_CSO_MATCHING'
  )[];
}): Promise<PageBoardPostResponse> {
  const response = await axios.request<PageBoardPostResponse>({
    method: 'GET',
    url: '/v1/boards',
    params: {
      ...options,
      noticeTypes: options?.noticeTypes?.join(','),
    },
  });
  return response.data;
}

/**
 * 게시글 작성
 * POST /v1/boards
 */
export async function createBoardPost(data: { files?: File[]; request: BoardPostCreateRequest }): Promise<string> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  if (data.files !== undefined) {
    for (const v of data.files) {
      form.append('files', v, v.name.normalize('NFC'));
    }
  }
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/boards',
    data: form,
  });
  return response.data;
}

/**
 * 게시판 사용자 조회
 * GET /v1/boards/members
 */
export async function getBoardMembers(options?: {
  userId?: string;
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  email?: string;
  contractStatus?: 'CONTRACT' | 'NON_CONTRACT';
  startAt?: DateString;
  endAt?: DateString;
  filterDeleted?: boolean;
  page?: number;
  size?: number;
}): Promise<PageBoardMemberStatsResponse> {
  const response = await axios.request<PageBoardMemberStatsResponse>({
    method: 'GET',
    url: '/v1/boards/members',
    params: options,
  });
  return response.data;
}

/**
 * 상단 고정 공지사항 게시글 조회
 * GET /v1/boards/notices/fixed-top
 */
export async function getFixedTopNotices(options?: {
  boardType?: 'ANONYMOUS' | 'MR_CSO_MATCHING' | 'NOTICE' | 'INQUIRY' | 'FAQ' | 'CSO_A_TO_Z' | 'EVENT' | 'SALES_AGENCY' | 'PRODUCT';
  filterBlind?: boolean;
  filterDeleted?: boolean;
  isExposed?: boolean;
  noticeTypes?: (
    | 'PRODUCT_STATUS'
    | 'MANUFACTURING_SUSPENSION'
    | 'NEW_PRODUCT'
    | 'POLICY'
    | 'GENERAL'
    | 'ANONYMOUS_BOARD'
    | 'MR_CSO_MATCHING'
  )[];
  exposureRanges?: ('ALL' | 'CONTRACTED' | 'UNCONTRACTED')[];
}): Promise<BoardPostResponse[]> {
  const response = await axios.request<BoardPostResponse[]>({
    method: 'GET',
    url: '/v1/boards/notices/fixed-top',
    params: {
      ...options,
      noticeTypes: options?.noticeTypes?.join(','),
      exposureRanges: options?.exposureRanges?.join(','),
    },
  });
  return response.data;
}

/**
 * 에디터 파일 업로드 API
 * POST /v1/boards/uploads
 */
export async function uploadEditorFile(data: { file: File }): Promise<AttachmentResponse> {
  const form = new FormData();
  form.append('file', data.file, data.file.name.normalize('NFC'));
  const response = await axios.request<AttachmentResponse>({
    method: 'POST',
    url: '/v1/boards/uploads',
    data: form,
  });
  return response.data;
}

/**
 * 게시판 상세 조회
 * GET /v1/boards/{id}
 */
export async function getBoardDetails(
  id: number,
  options?: {
    filterBlind?: boolean;
    filterDeleted?: boolean;
  },
): Promise<BoardDetailsResponse> {
  const response = await axios.request<BoardDetailsResponse>({
    method: 'GET',
    url: `/v1/boards/${id}`,
    params: options,
  });
  return response.data;
}

/**
 * 게시글 수정
 * PUT /v1/boards/{id}
 */
export async function updateBoardPost(
  id: number,
  data: {
    newFiles?: File[];
    updateRequest: BoardPostUpdateRequest;
  },
): Promise<string> {
  const form = new FormData();
  form.append('updateRequest', new Blob([JSON.stringify(data.updateRequest)], { type: 'application/json' }));
  if (data.newFiles !== undefined) {
    for (const v of data.newFiles) {
      form.append('newFiles', v, v.name.normalize('NFC'));
    }
  }
  const response = await axios.request<string>({
    method: 'PUT',
    url: `/v1/boards/${id}`,
    data: form,
  });
  return response.data;
}

/**
 * 게시글 삭제
 * DELETE /v1/boards/{id}
 */
export async function deleteBoardPost(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/boards/${id}`,
  });
}

/**
 * 좋아요 누르기/해제
 * POST /v1/boards/{id}/like
 */
export async function toggleLike_1(id: number): Promise<void> {
  await axios.request({
    method: 'POST',
    url: `/v1/boards/${id}/like`,
  });
}

/**
 * 게시글 블라인드 상태 설정/해제
 * PUT /v1/boards/{id}/toggle-blind
 */
export async function toggleBlindStatus_1(id: number): Promise<boolean> {
  const response = await axios.request<boolean>({
    method: 'PUT',
    url: `/v1/boards/${id}/toggle-blind`,
  });
  return response.data;
}

/**
 * 댓글 목록 조회
 * GET /v1/comments
 */
export async function getCommentMembers(options?: {
  userId?: string;
  nickname?: string;
  startAt?: DateString;
  endAt?: DateString;
  commentType?: 'COMMENT' | 'REPLY';
  filterBlind?: boolean;
  filterDeleted?: boolean;
  page?: number;
  size?: number;
}): Promise<PageCommentMemberResponse> {
  const response = await axios.request<PageCommentMemberResponse>({
    method: 'GET',
    url: '/v1/comments',
    params: options,
  });
  return response.data;
}

/**
 * 댓글 수정
 * PUT /v1/comments
 */
export async function updateComment(data: CommentUpdateRequest): Promise<string> {
  const response = await axios.request<string>({
    method: 'PUT',
    url: '/v1/comments',
    data,
  });
  return response.data;
}

/**
 * 댓글 삭제
 * DELETE /v1/comments/{id}
 */
export async function deleteComment(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/comments/${id}`,
  });
}

/**
 * POST /v1/comments/{id}/like
 */
export async function toggleLike(id: number): Promise<void> {
  await axios.request({
    method: 'POST',
    url: `/v1/comments/${id}/like`,
  });
}

/**
 * 댓글 블라인드 상태 설정/해제
 * PUT /v1/comments/{id}/toggle-blind
 */
export async function toggleBlindStatus(id: number): Promise<boolean> {
  const response = await axios.request<boolean>({
    method: 'PUT',
    url: `/v1/comments/${id}/toggle-blind`,
  });
  return response.data;
}

/**
 * 댓글 작성
 * POST /v1/comments/{userId}
 */
export async function createComment(userId: string, data: CommentCreateRequest): Promise<string> {
  const response = await axios.request<string>({
    method: 'POST',
    url: `/v1/comments/${userId}`,
    data,
  });
  return response.data;
}

/**
 * 내 딜러 목록 조회(현재 로그인 사용자 소속)
 * GET /v1/dealers
 */
export async function listDealers(options?: { dealerName?: string; drugCompanyName?: string }): Promise<DealerResponse[]> {
  const response = await axios.request<DealerResponse[]>({
    method: 'GET',
    url: '/v1/dealers',
    params: options,
  });
  return response.data;
}

/**
 * 딜러 생성(현재 로그인 사용자 소속)
 * POST /v1/dealers
 */
export async function createDealer(data: DealerCreateRequest): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/dealers',
    data,
  });
}

/**
 * member.userId로 owner dealer.id 조회
 * GET /v1/dealers/id/{userId}
 */
export async function getDealerIdByUserId(userId: string): Promise<number> {
  const response = await axios.request<number>({
    method: 'GET',
    url: `/v1/dealers/id/${userId}`,
  });
  return response.data;
}

/**
 * 제약사 전체 목록 조회
 * GET /v1/drug-companies
 */
export async function getAllDrugCompanies(): Promise<DrugCompanyResponse[]> {
  const response = await axios.request<DrugCompanyResponse[]>({
    method: 'GET',
    url: '/v1/drug-companies',
  });
  return response.data;
}

/**
 * 이벤트 리스트 조회
 * GET /v1/events
 */
export async function getEventBoards(options?: {
  status?: 'IN_PROGRESS' | 'FINISHED';
  isExposed?: boolean;
  exposureRanges?: ('ALL' | 'CONTRACTED' | 'UNCONTRACTED')[];
  title?: string;
  startAt?: DateString;
  endAt?: DateString;
  page?: number;
  size?: number;
}): Promise<PageEventBoardSummaryResponse> {
  const response = await axios.request<PageEventBoardSummaryResponse>({
    method: 'GET',
    url: '/v1/events',
    params: {
      ...options,
      exposureRanges: options?.exposureRanges?.join(','),
    },
  });
  return response.data;
}

/**
 * 이벤트 게시글 생성
 * POST /v1/events
 */
export async function createEventBoard(data: {
  eventRequest: EventBoardCreateRequest;
  files?: File[];
  request: BoardPostCreateRequest;
  thumbnail: File;
}): Promise<string> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  form.append('eventRequest', new Blob([JSON.stringify(data.eventRequest)], { type: 'application/json' }));
  form.append('thumbnail', data.thumbnail, data.thumbnail.name.normalize('NFC'));
  if (data.files !== undefined) {
    for (const v of data.files) {
      form.append('files', v, v.name.normalize('NFC'));
    }
  }
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/events',
    data: form,
  });
  return response.data;
}

/**
 * 이벤트 상세 조회
 * GET /v1/events/{id}
 */
export async function getEventBoardDetails(id: number): Promise<EventBoardDetailsResponse> {
  const response = await axios.request<EventBoardDetailsResponse>({
    method: 'GET',
    url: `/v1/events/${id}`,
  });
  return response.data;
}

/**
 * 이벤트 게시글 수정
 * PATCH /v1/events/{id}
 */
export async function updateEventBoard(
  id: number,
  data: {
    eventRequest?: EventBoardUpdateRequest;
    newFiles?: File[];
    request?: BoardPostUpdateRequest;
    thumbnail?: File;
  },
): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.eventRequest !== undefined) {
    form.append('eventRequest', new Blob([JSON.stringify(data.eventRequest)], { type: 'application/json' }));
  }
  if (data.thumbnail !== undefined) {
    form.append('thumbnail', data.thumbnail, data.thumbnail.name.normalize('NFC'));
  }
  if (data.newFiles !== undefined) {
    for (const v of data.newFiles) {
      form.append('newFiles', v, v.name.normalize('NFC'));
    }
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/events/${id}`,
    data: form,
  });
}

/**
 * 이벤트 게시글 삭제 (soft delete)
 * DELETE /v1/events/{id}
 */
export async function softDeleteEventBoard(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/events/${id}`,
  });
}

/**
 * 지출보고 목록 조회 (페이징)
 * GET /v1/expense-reports
 */
export async function getExpenseReportList(options?: {
  status?: 'PENDING' | 'COMPLETED';
  userId?: string;
  productName?: string;
  companyName?: string;
  reportType?: 'SAMPLE_PROVIDE' | 'PRODUCT_BRIEFING_MULTI' | 'PRODUCT_BRIEFING_SINGLE';
  eventDateFrom?: DateTimeString;
  eventDateTo?: DateTimeString;
  page?: number;
  size?: number;
}): Promise<PageExpenseReportResponse> {
  const response = await axios.request<PageExpenseReportResponse>({
    method: 'GET',
    url: '/v1/expense-reports',
    params: options,
  });
  return response.data;
}

/**
 * 지출보고 목록 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/expense-reports/excel-download
 */
export function getDownloadExpenseReportListExcel(options?: {
  status?: 'PENDING' | 'COMPLETED';
  userId?: string;
  productName?: string;
  companyName?: string;
  reportType?: 'SAMPLE_PROVIDE' | 'PRODUCT_BRIEFING_MULTI' | 'PRODUCT_BRIEFING_SINGLE';
  eventDateFrom?: DateTimeString;
  eventDateTo?: DateTimeString;
  page?: number;
  size?: number;
}): string {
  const baseUrl = '/v1/expense-reports/excel-download';
  const paramsInit = Object.entries(options ?? {})
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => [key, String(value)]);
  const params = new URLSearchParams(paramsInit);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * ExpenseReport 파일 일괄 다운로드
 * GET /v1/expense-reports/files/download
 */
export async function downloadExpenseReportFiles(options?: { ids?: number[] }): Promise<void> {
  await axios.request({
    method: 'GET',
    url: '/v1/expense-reports/files/download',
    params: {
      ...options,
      ids: options?.ids?.join(','),
    },
  });
}

/**
 * 지출보고 생성 - 제품설명회(복수기관)
 * POST /v1/expense-reports/product-briefing/multi
 */
export async function createProductBriefingMultiReport(data: {
  attachmentFiles?: File[];
  request: ProductBriefingMultiCreateRequest;
}): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  if (data.attachmentFiles !== undefined) {
    for (const v of data.attachmentFiles) {
      form.append('attachmentFiles', v, v.name.normalize('NFC'));
    }
  }
  await axios.request({
    method: 'POST',
    url: '/v1/expense-reports/product-briefing/multi',
    data: form,
  });
}

/**
 * 지출보고 조회 - 제품설명회(복수기관)
 * GET /v1/expense-reports/product-briefing/multi/{id}
 */
export async function getProductBriefingMultiReport(id: number): Promise<ProductBriefingMultiDetailResponse> {
  const response = await axios.request<ProductBriefingMultiDetailResponse>({
    method: 'GET',
    url: `/v1/expense-reports/product-briefing/multi/${id}`,
  });
  return response.data;
}

/**
 * 지출보고 수정 - 제품설명회(복수기관)
 * PATCH /v1/expense-reports/product-briefing/multi/{id}
 */
export async function updateProductBriefingMultiReport(
  id: number,
  data: {
    newFiles?: File[];
    request: ProductBriefingMultiUpdateRequest;
  },
): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  if (data.newFiles !== undefined) {
    for (const v of data.newFiles) {
      form.append('newFiles', v, v.name.normalize('NFC'));
    }
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/expense-reports/product-briefing/multi/${id}`,
    data: form,
  });
}

/**
 * 지출보고 생성 - 제품설명회(개별기관)
 * POST /v1/expense-reports/product-briefing/single
 */
export async function createProductBriefingSingleReport(data: {
  attachmentFiles?: File[];
  request: ProductBriefingSingleCreateRequest;
  signatureFiles: File[];
}): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  for (const v of data.signatureFiles) {
    form.append('signatureFiles', v, v.name.normalize('NFC'));
  }
  if (data.attachmentFiles !== undefined) {
    for (const v of data.attachmentFiles) {
      form.append('attachmentFiles', v, v.name.normalize('NFC'));
    }
  }
  await axios.request({
    method: 'POST',
    url: '/v1/expense-reports/product-briefing/single',
    data: form,
  });
}

/**
 * 지출보고 조회 - 제품설명회(개별기관)
 * GET /v1/expense-reports/product-briefing/single/{id}
 */
export async function getProductBriefingSingleReport(id: number): Promise<ProductBriefingSingleDetailResponse> {
  const response = await axios.request<ProductBriefingSingleDetailResponse>({
    method: 'GET',
    url: `/v1/expense-reports/product-briefing/single/${id}`,
  });
  return response.data;
}

/**
 * 지출보고 수정 - 제품설명회(개별기관)
 * PATCH /v1/expense-reports/product-briefing/single/{id}
 */
export async function updateProductBriefingSingleReport(
  id: number,
  data: {
    newFiles?: File[];
    request: ProductBriefingSingleUpdateRequest;
    signatureFiles?: File[];
  },
): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  if (data.signatureFiles !== undefined) {
    for (const v of data.signatureFiles) {
      form.append('signatureFiles', v, v.name.normalize('NFC'));
    }
  }
  if (data.newFiles !== undefined) {
    for (const v of data.newFiles) {
      form.append('newFiles', v, v.name.normalize('NFC'));
    }
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/expense-reports/product-briefing/single/${id}`,
    data: form,
  });
}

/**
 * 지출보고 생성 - 견본품 제공
 * POST /v1/expense-reports/sample-provide
 */
export async function createSampleProvideReport(data: {
  attachmentFiles?: File[];
  request: SampleProvideReportCreateRequest;
}): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  if (data.attachmentFiles !== undefined) {
    for (const v of data.attachmentFiles) {
      form.append('attachmentFiles', v, v.name.normalize('NFC'));
    }
  }
  await axios.request({
    method: 'POST',
    url: '/v1/expense-reports/sample-provide',
    data: form,
  });
}

/**
 * 지출보고 조회 - 견본품 제공
 * GET /v1/expense-reports/sample-provide/{id}
 */
export async function getSampleProvideReport(id: number): Promise<SampleProvideReportDetailResponse> {
  const response = await axios.request<SampleProvideReportDetailResponse>({
    method: 'GET',
    url: `/v1/expense-reports/sample-provide/${id}`,
  });
  return response.data;
}

/**
 * 지출보고 수정 - 견본품 제공
 * PATCH /v1/expense-reports/sample-provide/{id}
 */
export async function updateSampleProvideReport(
  id: number,
  data: {
    newFiles?: File[];
    request: SampleProvideReportUpdateRequest;
  },
): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  if (data.newFiles !== undefined) {
    for (const v of data.newFiles) {
      form.append('newFiles', v, v.name.normalize('NFC'));
    }
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/expense-reports/sample-provide/${id}`,
    data: form,
  });
}

/**
 * 지출보고서 첨부파일 ZIP 다운로드
 * GET /v1/expense-reports/{expenseReportId}/files/download
 */
export async function downloadExpenseReportFilesZip(expenseReportId: number): Promise<void> {
  await axios.request({
    method: 'GET',
    url: `/v1/expense-reports/${expenseReportId}/files/download`,
  });
}

/**
 * 지출보고 삭제 (연관 엔티티 포함)
 * DELETE /v1/expense-reports/{id}
 */
export async function deleteExpenseReport(
  id: number,
  options?: {
    softDeleteS3?: boolean;
  },
): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/expense-reports/${id}`,
    params: options,
  });
}

/**
 * GET /v1/expense-reports/{id}/download
 */
export async function downloadExpenseReport(id: number): Promise<void> {
  await axios.request({
    method: 'GET',
    url: `/v1/expense-reports/${id}/download`,
  });
}

/**
 * 개원병원 목록 조회
 * GET /v1/hospitals
 */
export async function getHospitals(options?: {
  regionCategoryId?: number;
  hospitalName?: string;
  startDate?: DateTimeString;
  endDate?: DateTimeString;
  page?: number;
  size?: number;
}): Promise<PageHospitalResponse> {
  const response = await axios.request<PageHospitalResponse>({
    method: 'GET',
    url: '/v1/hospitals',
    params: options,
  });
  return response.data;
}

/**
 * 요청 기준일 포함 최근 한 달 사이 오픈한 병원 수
 * GET /v1/hospitals/opened/count
 */
export async function getRecentlyOpenedCount(options?: { referenceDate?: DateString }): Promise<number> {
  const response = await axios.request<number>({
    method: 'GET',
    url: '/v1/hospitals/opened/count',
    params: options,
  });
  return response.data;
}

/**
 * 전체 시/도 목록(depth=1)
 * GET /v1/hospitals/regions/sido
 */
export async function getAllSido(): Promise<RegionCategoryResponse[]> {
  const response = await axios.request<RegionCategoryResponse[]>({
    method: 'GET',
    url: '/v1/hospitals/regions/sido',
  });
  return response.data;
}

/**
 * 특정 시/도의 시군구 목록(depth=2, parent=sido)
 * GET /v1/hospitals/regions/sido/{sidoId}/sigungu
 */
export async function getSigunguBySido(sidoId: number): Promise<RegionCategoryResponse[]> {
  const response = await axios.request<RegionCategoryResponse[]>({
    method: 'GET',
    url: `/v1/hospitals/regions/sido/${sidoId}/sigungu`,
  });
  return response.data;
}

/**
 * 엑셀 파일 업로드
 * POST /v1/hospitals/upload
 */
export async function uploadHospitalExcel(data: { file: File }): Promise<string> {
  const form = new FormData();
  form.append('file', data.file, data.file.name.normalize('NFC'));
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/hospitals/upload',
    data: form,
  });
  return response.data;
}

/**
 * 병원 삭제
 * DELETE /v1/hospitals/{id}
 */
export async function softDeleteHospital(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/hospitals/${id}`,
  });
}

/**
 * POST /v1/kmc/auth/callback
 */
export async function handleCallback(options?: { apiToken?: string; certNum?: string }): Promise<string> {
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/kmc/auth/callback',
    params: options,
  });
  return response.data;
}

/**
 * GET /v1/kmc/auth/callback-page
 */
export async function callbackPage(options?: { certNum?: string }): Promise<string> {
  const response = await axios.request<string>({
    method: 'GET',
    url: '/v1/kmc/auth/callback-page',
    params: options,
  });
  return response.data;
}

/**
 * POST /v1/kmc/auth/callback-page
 */
export async function callbackPage_1(options?: { certNum?: string }): Promise<string> {
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/kmc/auth/callback-page',
    params: options,
  });
  return response.data;
}

/**
 * GET /v1/kmc/auth/launch
 */
export async function launch(options?: { certNum?: string }): Promise<string> {
  const response = await axios.request<string>({
    method: 'GET',
    url: '/v1/kmc/auth/launch',
    params: options,
  });
  return response.data;
}

/**
 * POST /v1/kmc/auth/request
 */
export async function createAuthRequest(data: KmcAuthRequest): Promise<KmcAuthResponse> {
  const response = await axios.request<KmcAuthResponse>({
    method: 'POST',
    url: '/v1/kmc/auth/request',
    data,
  });
  return response.data;
}

/**
 * GET /v1/kmc/auth/result
 */
export async function result(options?: { certNum?: string }): Promise<Record<string, {}>> {
  const response = await axios.request<Record<string, {}>>({
    method: 'GET',
    url: '/v1/kmc/auth/result',
    params: options,
  });
  return response.data;
}

/**
 * 회원 목록 조회
 * GET /v1/members
 */
export async function getUserMembers(options?: {
  memberId?: number;
  userId?: string;
  roles?: ('USER' | 'ADMIN' | 'SUPER_ADMIN')[];
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  email?: string;
  companyName?: string;
  contractStatus?: 'CONTRACT' | 'NON_CONTRACT';
  startAt?: DateString;
  endAt?: DateString;
  page?: number;
  size?: number;
}): Promise<PageMemberResponse> {
  const response = await axios.request<PageMemberResponse>({
    method: 'GET',
    url: '/v1/members',
    params: {
      ...options,
      roles: options?.roles?.join(','),
    },
  });
  return response.data;
}

/**
 * 회원가입
 * POST /v1/members
 */
export async function signup(data: { file?: File; request: MemberSignupRequest }): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  if (data.file !== undefined) {
    form.append('file', data.file, data.file.name.normalize('NFC'));
  }
  await axios.request({
    method: 'POST',
    url: '/v1/members',
    data: form,
  });
}

/**
 * admin 가입
 * POST /v1/members/admins
 */
export async function signupByAdmin(data: AdminCreateRequest): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/members/admins',
    data,
  });
}

/**
 * admin 정보 수정
 * PATCH /v1/members/admins/{userId}
 */
export async function updateByAdmin(userId: string, data: AdminUpdateRequest): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/members/admins/${userId}`,
    data,
  });
}

/**
 * 관리자 권한 조회
 * GET /v1/members/admins/{userId}/permissions
 */
export async function getPermissions(userId: string): Promise<AdminPermissionResponse> {
  const response = await axios.request<AdminPermissionResponse>({
    method: 'GET',
    url: `/v1/members/admins/${userId}/permissions`,
  });
  return response.data;
}

/**
 * 닉네임 중복 확인
 * POST /v1/members/available-nickname
 */
export async function isAvailableNickname(data: NicknameCheckRequest): Promise<NicknameCheckResponse> {
  const response = await axios.request<NicknameCheckResponse>({
    method: 'POST',
    url: '/v1/members/available-nickname',
    data,
  });
  return response.data;
}

/**
 * 전화번호 중복 확인
 * POST /v1/members/available-phone
 */
export async function checkPhone(options?: { phone?: string }): Promise<boolean> {
  const response = await axios.request<boolean>({
    method: 'POST',
    url: '/v1/members/available-phone',
    params: options,
  });
  return response.data;
}

/**
 * 비밀번호 확인 (현재 로그인 사용자)
 * POST /v1/members/check-password
 */
export async function checkPassword(options?: { password?: string }): Promise<boolean> {
  const response = await axios.request<boolean>({
    method: 'POST',
    url: '/v1/members/check-password',
    params: options,
  });
  return response.data;
}

/**
 * 회원 목록 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/members/excel-download
 */
export function getDownloadUserMembersExcel(options?: {
  memberId?: number;
  userId?: string;
  roles?: ('USER' | 'ADMIN' | 'SUPER_ADMIN')[];
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  email?: string;
  companyName?: string;
  contractStatus?: 'CONTRACT' | 'NON_CONTRACT';
  startAt?: DateString;
  endAt?: DateString;
  page?: number;
  size?: number;
}): string {
  const baseUrl = '/v1/members/excel-download';
  const paramsInit = Object.entries(options ?? {})
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => [key, String(value)]);
  const params = new URLSearchParams(paramsInit);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * 푸시 설정 조회
 * GET /v1/members/me/push-preferences
 */
export async function getPushPreferences(): Promise<PushPreferenceResponse> {
  const response = await axios.request<PushPreferenceResponse>({
    method: 'GET',
    url: '/v1/members/me/push-preferences',
  });
  return response.data;
}

/**
 * 푸시 설정 부분 수정
 * PATCH /v1/members/me/push-preferences
 */
export async function patchPushPreferences(data: PushPreferenceUpdateRequest): Promise<PushPreferenceResponse> {
  const response = await axios.request<PushPreferenceResponse>({
    method: 'PATCH',
    url: '/v1/members/me/push-preferences',
    data,
  });
  return response.data;
}

/**
 * 회원 정보 수정
 * PATCH /v1/members/{userId}
 */
export async function updateMember(
  userId: string,
  data: {
    file?: File;
    request: MemberUpdateRequest;
  },
): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  if (data.file !== undefined) {
    form.append('file', data.file, data.file.name.normalize('NFC'));
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/members/${userId}`,
    data: form,
  });
}

/**
 * 회원 탈퇴
 * DELETE /v1/members/{userId}
 */
export async function deleteMember(userId: string): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/members/${userId}`,
  });
}

/**
 * 아이디 중복 체크
 * GET /v1/members/{userId}/available
 */
export async function isUserIdAvailable(userId: string): Promise<boolean> {
  const response = await axios.request<boolean>({
    method: 'GET',
    url: `/v1/members/${userId}/available`,
  });
  return response.data;
}

/**
 * CSO 신고증 승인/반려 처리
 * PATCH /v1/members/{userId}/cso-approval
 */
export async function approveOrRejectCso(
  userId: string,
  options?: {
    isApproved?: boolean;
  },
): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/members/${userId}/cso-approval`,
    params: options,
  });
}

/**
 * 회원 상세 조회
 * GET /v1/members/{userId}/details
 */
export async function getMemberDetails(userId: string): Promise<MemberDetailsResponse> {
  const response = await axios.request<MemberDetailsResponse>({
    method: 'GET',
    url: `/v1/members/${userId}/details`,
  });
  return response.data;
}

/**
 * 닉네임 변경
 * POST /v1/members/{userId}/nickname
 */
export async function updateNickname(data: NicknameUpdateRequest): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/members/{userId}/nickname',
    data,
  });
}

/**
 * 비밀번호 변경
 * PATCH /v1/members/{userId}/password
 */
export async function changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/members/${userId}/password`,
    data,
  });
}

/**
 * 비밀번호 변경
 * PATCH /v1/members/{userId}/password-for-find-account
 */
export async function changePassword_1(userId: string, data: ChangePasswordForFindAccountRequest): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/members/${userId}/password-for-find-account`,
    data,
  });
}

/**
 * 파트너 계약 신청
 * POST /v1/partner-contracts
 */
export async function applyContract(data: {
  business_registration: File;
  cso_certificate: File;
  education_certificate: File;
  request: PartnerContractRequest;
  subcontract_agreement?: File;
}): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  form.append('business_registration', data.business_registration, data.business_registration.name.normalize('NFC'));
  if (data.subcontract_agreement !== undefined) {
    form.append('subcontract_agreement', data.subcontract_agreement, data.subcontract_agreement.name.normalize('NFC'));
  }
  form.append('cso_certificate', data.cso_certificate, data.cso_certificate.name.normalize('NFC'));
  form.append('education_certificate', data.education_certificate, data.education_certificate.name.normalize('NFC'));
  await axios.request({
    method: 'POST',
    url: '/v1/partner-contracts',
    data: form,
  });
}

/**
 * 파트너 계약 승인
 * POST /v1/partner-contracts/{contractId}/approve
 */
export async function approveContract(contractId: number): Promise<void> {
  await axios.request({
    method: 'POST',
    url: `/v1/partner-contracts/${contractId}/approve`,
  });
}

/**
 * 파트너 계약 종료 및 신청 거절
 * POST /v1/partner-contracts/{contractId}/reject
 */
export async function rejectContract(contractId: number): Promise<void> {
  await axios.request({
    method: 'POST',
    url: `/v1/partner-contracts/${contractId}/reject`,
  });
}

/**
 * 파트너 계약 수정
 * POST /v1/partner-contracts/{contractId}/update
 */
export async function updateContract(
  contractId: number,
  data: {
    business_registration?: File;
    cso_certificate?: File;
    education_certificate?: File;
    request: PartnerContractUpdateRequest;
    subcontract_agreement?: File;
  },
): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  if (data.business_registration !== undefined) {
    form.append('business_registration', data.business_registration, data.business_registration.name.normalize('NFC'));
  }
  if (data.subcontract_agreement !== undefined) {
    form.append('subcontract_agreement', data.subcontract_agreement, data.subcontract_agreement.name.normalize('NFC'));
  }
  if (data.cso_certificate !== undefined) {
    form.append('cso_certificate', data.cso_certificate, data.cso_certificate.name.normalize('NFC'));
  }
  if (data.education_certificate !== undefined) {
    form.append('education_certificate', data.education_certificate, data.education_certificate.name.normalize('NFC'));
  }
  await axios.request({
    method: 'POST',
    url: `/v1/partner-contracts/${contractId}/update`,
    data: form,
  });
}

/**
 * 파트너 계약 상세 조회
 * GET /v1/partner-contracts/{userId}
 */
export async function getContractDetails(userId: string): Promise<PartnerContractDetailsResponse> {
  const response = await axios.request<PartnerContractDetailsResponse>({
    method: 'GET',
    url: `/v1/partner-contracts/${userId}`,
  });
  return response.data;
}

/**
 * 거래선 조회
 * GET /v1/partners
 */
export async function getPartners(options?: {
  companyName?: string;
  institutionName?: string;
  drugCompanyName?: string;
  memberName?: string;
  institutionCode?: string;
  contractType?: 'CONTRACT' | 'NON_CONTRACT';
  memberType?: 'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION';
  page?: number;
  size?: number;
}): Promise<PagePartnerResponse> {
  const response = await axios.request<PagePartnerResponse>({
    method: 'GET',
    url: '/v1/partners',
    params: options,
  });
  return response.data;
}

/**
 * 거래선 등록
 * POST /v1/partners
 */
export async function createPartner(data: PartnerCreateRequest): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/partners',
    data,
  });
}

/**
 * 제약사명 목록 조회
 * GET /v1/partners/drug-companies
 */
export async function getDrugCompanies(): Promise<DrugCompanyResponse[]> {
  const response = await axios.request<DrugCompanyResponse[]>({
    method: 'GET',
    url: '/v1/partners/drug-companies',
  });
  return response.data;
}

/**
 * member.userId로 소유 파트너 ID 목록 조회
 * GET /v1/partners/ids/{userId}
 */
export async function getPartnerIdsByUserId(userId: string): Promise<number[]> {
  const response = await axios.request<number[]>({
    method: 'GET',
    url: `/v1/partners/ids/${userId}`,
  });
  return response.data;
}

/**
 * 거래선 엑셀 업로드
 * POST /v1/partners/upload/{userId}
 */
export async function uploadPartnersExcel(
  userId: string,
  data: {
    file: File;
  },
): Promise<void> {
  const form = new FormData();
  form.append('file', data.file, data.file.name.normalize('NFC'));
  await axios.request({
    method: 'POST',
    url: `/v1/partners/upload/${userId}`,
    data: form,
  });
}

/**
 * 거래선 상세 조회
 * GET /v1/partners/{id}
 */
export async function getPartnerDetails(id: number): Promise<PartnerResponse> {
  const response = await axios.request<PartnerResponse>({
    method: 'GET',
    url: `/v1/partners/${id}`,
  });
  return response.data;
}

/**
 * 거래선 수정
 * PUT /v1/partners/{id}
 */
export async function updatePartner(id: number, data: PartnerUpdateRequest): Promise<void> {
  await axios.request({
    method: 'PUT',
    url: `/v1/partners/${id}`,
    data,
  });
}

/**
 * 거래선 삭제 (soft delete)
 * DELETE /v1/partners/{id}
 */
export async function deletePartner(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/partners/${id}`,
  });
}

/**
 * 처방 접수 목록 조회
 * GET /v1/prescriptions
 */
export async function searchPrescriptions(options?: {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  companyName?: string;
  userId?: string;
  dealerName?: string;
  drugCompanyName?: string;
  institutionName?: string;
  dealerId?: number;
  startAt?: DateTimeString;
  endAt?: DateTimeString;
  page?: number;
  size?: number;
}): Promise<PagePrescriptionResponse> {
  const response = await axios.request<PagePrescriptionResponse>({
    method: 'GET',
    url: '/v1/prescriptions',
    params: options,
  });
  return response.data;
}

/**
 * 월 통계 캐시 삭제
 * POST /v1/prescriptions/cache/evict
 */
export async function evict(): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/prescriptions/cache/evict',
  });
}

/**
 * 요청 날짜가 속한 월의 처방전 수 (submittedDate 기준)
 * GET /v1/prescriptions/monthly-count
 */
export async function monthlyCount(options?: { referenceDate?: number }): Promise<MonthlyPrescriptionCountResponse> {
  const response = await axios.request<MonthlyPrescriptionCountResponse>({
    method: 'GET',
    url: '/v1/prescriptions/monthly-count',
    params: options,
  });
  return response.data;
}

/**
 * 요청 날짜가 속한 월의 수수료 합계 (submittedDate 기준)
 * GET /v1/prescriptions/monthly-total-amount
 */
export async function monthlyTotalAmount(options?: { referenceDate?: number }): Promise<MonthlyTotalAmountResponse> {
  const response = await axios.request<MonthlyTotalAmountResponse>({
    method: 'GET',
    url: '/v1/prescriptions/monthly-total-amount',
    params: options,
  });
  return response.data;
}

/**
 * 거래처별 EDI 파일 업로드
 * POST /v1/prescriptions/partner-files
 */
export async function uploadPartnerEdiFiles(data: { files: File[]; request: PrescriptionCreateRequest }): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  for (const v of data.files) {
    form.append('files', v, v.name.normalize('NFC'));
  }
  await axios.request({
    method: 'POST',
    url: '/v1/prescriptions/partner-files',
    data: form,
  });
}

/**
 * 거래처별 EDI 파일 업데이트 (파라미터 부분 변경 + 파일 keep/new 반영)
 * POST /v1/prescriptions/partner-files/update
 */
export async function updatePartnerEdiFiles(data: { files?: File[]; request: PrescriptionUpdateRequest }): Promise<void> {
  const form = new FormData();
  form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  if (data.files !== undefined) {
    for (const v of data.files) {
      form.append('files', v, v.name.normalize('NFC'));
    }
  }
  await axios.request({
    method: 'POST',
    url: '/v1/prescriptions/partner-files/update',
    data: form,
  });
}

/**
 * 처방 제품 항목 저장
 * POST /v1/prescriptions/partner-products
 */
export async function createPartnerProducts(data: PrescriptionPartnerProductCreateRequest): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/prescriptions/partner-products',
    data,
  });
}

/**
 * 처방 입력 목록 조회
 * GET /v1/prescriptions/partners
 */
export async function getPrescriptionPartnerList(options?: {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  companyName?: string;
  institutionName?: string;
  drugCompany?: string;
  dealerName?: string;
  prescriptionMonthStart?: DateTimeString;
  prescriptionMonthEnd?: DateTimeString;
  settlementMonthStart?: DateTimeString;
  settlementMonthEnd?: DateTimeString;
  page?: number;
  size?: number;
}): Promise<PagePrescriptionPartnerResponse> {
  const response = await axios.request<PagePrescriptionPartnerResponse>({
    method: 'GET',
    url: '/v1/prescriptions/partners',
    params: options,
  });
  return response.data;
}

/**
 * 처방접수 EDI 파일 다운로드
 * GET /v1/prescriptions/partners/{prescriptionId}/edi-files/download
 */
export async function downloadZippedEdiFiles(prescriptionId: number): Promise<void> {
  await axios.request({
    method: 'GET',
    url: `/v1/prescriptions/partners/${prescriptionId}/edi-files/download`,
  });
}

/**
 * 처방 입력 단건 조회
 * GET /v1/prescriptions/partners/{prescriptionPartnerId}
 */
export async function getPrescriptionPartner(prescriptionPartnerId: number): Promise<PrescriptionPartnerResponse> {
  const response = await axios.request<PrescriptionPartnerResponse>({
    method: 'GET',
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}`,
  });
  return response.data;
}

/**
 * 처방 입력 삭제
 * DELETE /v1/prescriptions/partners/{prescriptionPartnerId}
 */
export async function deletePrescriptionPartner(prescriptionPartnerId: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}`,
  });
}

/**
 * 처방 입력 승인
 * PATCH /v1/prescriptions/partners/{prescriptionPartnerId}/complete
 */
export async function completePrescriptionPartner(prescriptionPartnerId: number): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}/complete`,
  });
}

/**
 * 거래처별 제품상세 EDI 파일 보기
 * GET /v1/prescriptions/partners/{prescriptionPartnerId}/edi-files/attached
 */
export async function getAttachedEdiFiles(prescriptionPartnerId: number): Promise<AttachmentResponse[]> {
  const response = await axios.request<AttachmentResponse[]>({
    method: 'GET',
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}/edi-files/attached`,
  });
  return response.data;
}

/**
 * 처방 입력 제품 목록 조회
 * GET /v1/prescriptions/partners/{prescriptionPartnerId}/products
 */
export async function getPartnerProducts(prescriptionPartnerId: number): Promise<PrescriptionPartnerProductResponse[]> {
  const response = await axios.request<PrescriptionPartnerProductResponse[]>({
    method: 'GET',
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}/products`,
  });
  return response.data;
}

/**
 * 처방 입력 제품 목록 수정(삭제/부분수정/신규추가)
 * PATCH /v1/prescriptions/partners/{prescriptionPartnerId}/products
 */
export async function upsertPatchPartnerProducts(
  prescriptionPartnerId: number,
  data: PrescriptionPartnerProductUpsertRequest,
): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}/products`,
    data,
  });
}

/**
 * Original OCR vs Current diff (quantity/totalAmount/baseFeeRate/feeAmount)
 * GET /v1/prescriptions/partners/{prescriptionPartnerId}/products/ocr-original-diff
 */
export async function getOriginalOcrDiff(prescriptionPartnerId: number): Promise<OcrOriginalDiffRowResponse[]> {
  const response = await axios.request<OcrOriginalDiffRowResponse[]>({
    method: 'GET',
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}/products/ocr-original-diff`,
  });
  return response.data;
}

/**
 * EDI ZIP 파일 업로드 (단일 파라미터 기반)
 * POST /v1/prescriptions/zip
 */
export async function uploadEdiZipV2(data: {
  dealerId: number;
  file: File;
  partnerId: number;
  prescriptionMonth: string;
  settlementMonth: string;
}): Promise<PrescriptionZipUploadResult> {
  const form = new FormData();
  form.append('dealerId', String(data.dealerId));
  form.append('partnerId', String(data.partnerId));
  form.append('prescriptionMonth', data.prescriptionMonth);
  form.append('settlementMonth', data.settlementMonth);
  form.append('file', data.file, data.file.name.normalize('NFC'));
  const response = await axios.request<PrescriptionZipUploadResult>({
    method: 'POST',
    url: '/v1/prescriptions/zip',
    data: form,
  });
  return response.data;
}

/**
 * 처방 접수 관리자 확인
 * PATCH /v1/prescriptions/{id}/confirm
 */
export async function confirmPrescription(id: number): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/prescriptions/${id}/confirm`,
  });
}

/**
 * 제품 정보 목록 조회
 * GET /v1/products
 */
export async function getProductSummaries(options?: {
  productName?: string;
  composition?: string;
  productCode?: string;
  manufacturerName?: string;
  note?: string;
  isAcquisition?: boolean;
  isPromotion?: boolean;
  isOutOfStock?: boolean;
  isStopSelling?: boolean;
  sortType?: 'LATEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'FEE_RATE_ASC' | 'FEE_RATE_DESC';
  page?: number;
  size?: number;
}): Promise<PageProductSummaryResponse> {
  const response = await axios.request<PageProductSummaryResponse>({
    method: 'GET',
    url: '/v1/products',
    params: options,
  });
  return response.data;
}

/**
 * 제품 정보 목록 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/products/excel-download
 */
export function getDownloadProductSummariesExcel(options?: {
  productName?: string;
  composition?: string;
  productCode?: string;
  manufacturerName?: string;
  note?: string;
  isAcquisition?: boolean;
  isPromotion?: boolean;
  isOutOfStock?: boolean;
  isStopSelling?: boolean;
  sortType?: 'LATEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'FEE_RATE_ASC' | 'FEE_RATE_DESC';
  page?: number;
  size?: number;
}): string {
  const baseUrl = '/v1/products/excel-download';
  const paramsInit = Object.entries(options ?? {})
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => [key, String(value)]);
  const params = new URLSearchParams(paramsInit);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * PUT /v1/products/export-to-root-tsv
 */
export async function exportAll(): Promise<string> {
  const response = await axios.request<string>({
    method: 'PUT',
    url: '/v1/products/export-to-root-tsv',
  });
  return response.data;
}

/**
 * 제품 추가 정보 생성
 * POST /v1/products/extra-info
 */
export async function createProductExtraInfo(data: {
  boardPostCreateRequest: BoardPostCreateRequest;
  files?: File[];
  productExtraInfoCreateRequest: ProductExtraInfoRequest;
}): Promise<void> {
  const form = new FormData();
  form.append('boardPostCreateRequest', new Blob([JSON.stringify(data.boardPostCreateRequest)], { type: 'application/json' }));
  form.append(
    'productExtraInfoCreateRequest',
    new Blob([JSON.stringify(data.productExtraInfoCreateRequest)], { type: 'application/json' }),
  );
  if (data.files !== undefined) {
    for (const v of data.files) {
      form.append('files', v, v.name.normalize('NFC'));
    }
  }
  await axios.request({
    method: 'POST',
    url: '/v1/products/extra-info',
    data: form,
  });
}

/**
 * 제품 엑셀 업로드
 * POST /v1/products/product-extra-info/upload
 */
export async function uploadProductExtraInfo(data: { file: File }): Promise<void> {
  const form = new FormData();
  form.append('file', data.file, data.file.name.normalize('NFC'));
  await axios.request({
    method: 'POST',
    url: '/v1/products/product-extra-info/upload',
    data: form,
  });
}

/**
 * POST /v1/products/upload-kims-from-s3
 */
export async function uploadFromS3(options?: { prefix?: string }): Promise<string> {
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/products/upload-kims-from-s3',
    params: options,
  });
  return response.data;
}

/**
 * 제품 삭제
 * DELETE /v1/products/{id}
 */
export async function softDelete(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/products/${id}`,
  });
}

/**
 * 제품 정보 상세
 * GET /v1/products/{id}/details
 */
export async function getProductDetails(id: number): Promise<ProductDetailsResponse> {
  const response = await axios.request<ProductDetailsResponse>({
    method: 'GET',
    url: `/v1/products/${id}/details`,
  });
  return response.data;
}

/**
 * 제품 추가 정보 update
 * PATCH /v1/products/{id}/extra-info
 */
export async function updateProductExtraInfo(
  id: number,
  data: {
    boardPostUpdateRequest: BoardPostUpdateRequest;
    newFiles?: File[];
    productExtraInfoCreateRequest: ProductExtraInfoRequest;
  },
): Promise<void> {
  const form = new FormData();
  form.append('boardPostUpdateRequest', new Blob([JSON.stringify(data.boardPostUpdateRequest)], { type: 'application/json' }));
  form.append(
    'productExtraInfoCreateRequest',
    new Blob([JSON.stringify(data.productExtraInfoCreateRequest)], { type: 'application/json' }),
  );
  if (data.newFiles !== undefined) {
    for (const v of data.newFiles) {
      form.append('newFiles', v, v.name.normalize('NFC'));
    }
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/products/${id}/extra-info`,
    data: form,
  });
}

/**
 * 제품 정보 delete
 * DELETE /v1/products/{id}/extra-info
 */
export async function updateProductExtraInfo_1(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/products/${id}/extra-info`,
  });
}

/**
 * 신고하기
 * POST /v1/reports/{userId}
 */
export async function createReport(userId: string, data: ReportCreateRequest): Promise<string> {
  const response = await axios.request<string>({
    method: 'POST',
    url: `/v1/reports/${userId}`,
    data,
  });
  return response.data;
}

/**
 * 영업대행 상품 목록 조회
 * GET /v1/sales-agency-products
 */
export async function getSalesAgencyProducts(options?: {
  productName?: string;
  clientName?: string;
  exposureRanges?: ('ALL' | 'CONTRACTED' | 'UNCONTRACTED')[];
  startAt?: DateString;
  endAt?: DateString;
  isExposed?: boolean;
  page?: number;
  size?: number;
}): Promise<PageSalesAgencyProductSummaryResponse> {
  const response = await axios.request<PageSalesAgencyProductSummaryResponse>({
    method: 'GET',
    url: '/v1/sales-agency-products',
    params: {
      ...options,
      exposureRanges: options?.exposureRanges?.join(','),
    },
  });
  return response.data;
}

/**
 * 영업 대행 상품 게시글 생성
 * POST /v1/sales-agency-products
 */
export async function createSalesAgencyProductBoard(data: {
  boardPostCreateRequest: BoardPostCreateRequest;
  files?: File[];
  salesAgencyProductCreateRequest: SalesAgencyProductCreateRequest;
  thumbnail: File;
}): Promise<string> {
  const form = new FormData();
  form.append('boardPostCreateRequest', new Blob([JSON.stringify(data.boardPostCreateRequest)], { type: 'application/json' }));
  form.append(
    'salesAgencyProductCreateRequest',
    new Blob([JSON.stringify(data.salesAgencyProductCreateRequest)], { type: 'application/json' }),
  );
  form.append('thumbnail', data.thumbnail, data.thumbnail.name.normalize('NFC'));
  if (data.files !== undefined) {
    for (const v of data.files) {
      form.append('files', v, v.name.normalize('NFC'));
    }
  }
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/sales-agency-products',
    data: form,
  });
  return response.data;
}

/**
 * 영업대행 상품 신청자 비고 일괄 수정
 * PATCH /v1/sales-agency-products/applicants/notes
 */
export async function updateApplicantNotes(data: SalesAgencyProductNoteUpdateRequest): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: '/v1/sales-agency-products/applicants/notes',
    data,
  });
}

/**
 * 영업대행 상품 목록 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/sales-agency-products/excel-download
 */
export function getDownloadSalesAgencyProductsExcel(options?: {
  productName?: string;
  clientName?: string;
  exposureRanges?: ('ALL' | 'CONTRACTED' | 'UNCONTRACTED')[];
  startAt?: DateString;
  endAt?: DateString;
  isExposed?: boolean;
  page?: number;
  size?: number;
}): string {
  const baseUrl = '/v1/sales-agency-products/excel-download';
  const paramsInit = Object.entries(options ?? {})
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => [key, String(value)]);
  const params = new URLSearchParams(paramsInit);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * 영업대행 상품 신청자 삭제
 * DELETE /v1/sales-agency-products/{applicantUserId}/applicant
 */
export async function deleteSalesAgencyProductApplicant(
  applicantUserId: string,
  options?: {
    productBoardId?: number;
  },
): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/sales-agency-products/${applicantUserId}/applicant`,
    params: options,
  });
}

/**
 * 영업대행 상품 상세 조회
 * GET /v1/sales-agency-products/{id}
 */
export async function getSalesAgencyProductDetails(id: number): Promise<SalesAgencyProductDetailsResponse> {
  const response = await axios.request<SalesAgencyProductDetailsResponse>({
    method: 'GET',
    url: `/v1/sales-agency-products/${id}`,
  });
  return response.data;
}

/**
 * 영업 대행 상품 게시글 수정
 * PATCH /v1/sales-agency-products/{id}
 */
export async function updateSalesAgencyProductBoard(
  id: number,
  data: {
    boardPostUpdateRequest?: BoardPostUpdateRequest;
    newFiles?: File[];
    salesAgencyProductUpdateRequest?: SalesAgencyProductUpdateRequest;
    thumbnail?: File;
  },
): Promise<void> {
  const form = new FormData();
  if (data.boardPostUpdateRequest !== undefined) {
    form.append('boardPostUpdateRequest', new Blob([JSON.stringify(data.boardPostUpdateRequest)], { type: 'application/json' }));
  }
  if (data.salesAgencyProductUpdateRequest !== undefined) {
    form.append(
      'salesAgencyProductUpdateRequest',
      new Blob([JSON.stringify(data.salesAgencyProductUpdateRequest)], { type: 'application/json' }),
    );
  }
  if (data.thumbnail !== undefined) {
    form.append('thumbnail', data.thumbnail, data.thumbnail.name.normalize('NFC'));
  }
  if (data.newFiles !== undefined) {
    for (const v of data.newFiles) {
      form.append('newFiles', v, v.name.normalize('NFC'));
    }
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/sales-agency-products/${id}`,
    data: form,
  });
}

/**
 * 영업대행 상품 삭제
 * DELETE /v1/sales-agency-products/{id}
 */
export async function deleteSalesAgencyProduct(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/sales-agency-products/${id}`,
  });
}

/**
 * 영업대행 상품 신청자 목록 조회
 * GET /v1/sales-agency-products/{id}/applicants
 */
export async function getProductApplicants(
  id: number,
  options?: {
    userId?: string;
    name?: string;
    page?: number;
    size?: number;
  },
): Promise<PageSalesAgencyProductApplicantResponse> {
  const response = await axios.request<PageSalesAgencyProductApplicantResponse>({
    method: 'GET',
    url: `/v1/sales-agency-products/${id}/applicants`,
    params: options,
  });
  return response.data;
}

/**
 * 영업대행 상품 신청자 목록 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/sales-agency-products/{id}/applicants/excel-download
 */
export function getDownloadProductApplicantsExcel(
  id: number,
  options?: {
    userId?: string;
    name?: string;
    page?: number;
    size?: number;
  },
): string {
  const baseUrl = `/v1/sales-agency-products/${id}/applicants/excel-download`;
  const paramsInit = Object.entries(options ?? {})
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => [key, String(value)]);
  const params = new URLSearchParams(paramsInit);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * 영업대행 상품 신청
 * POST /v1/sales-agency-products/{id}/apply
 */
export async function applyProduct(id: number): Promise<void> {
  await axios.request({
    method: 'POST',
    url: `/v1/sales-agency-products/${id}/apply`,
  });
}

/**
 * 정산내역 목록 조회
 * GET /v1/settlements
 */
export async function getSettlements(options?: {
  dealerName?: string;
  dealerId?: number;
  drugCompanyName?: string;
  companyName?: string;
  status?: 'REQUEST' | 'OBJECTION';
  startMonth?: DateString;
  endMonth?: DateString;
  page?: number;
  size?: number;
}): Promise<PageSettlementResponse> {
  const response = await axios.request<PageSettlementResponse>({
    method: 'GET',
    url: '/v1/settlements',
    params: options,
  });
  return response.data;
}

/**
 * 정산내역 목록 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/settlements/excel-download
 */
export function getDownloadSettlementListExcel(options?: {
  dealerName?: string;
  dealerId?: number;
  companyName?: string;
  drugCompanyName?: string;
  status?: 'REQUEST' | 'OBJECTION';
  startMonth?: DateString;
  endMonth?: DateString;
  page?: number;
  size?: number;
}): string {
  const baseUrl = '/v1/settlements/excel-download';
  const paramsInit = Object.entries(options ?? {})
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => [key, String(value)]);
  const params = new URLSearchParams(paramsInit);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * GET /v1/settlements/export-zip
 */
export async function exportGroupedZip(options?: {
  startMonth?: DateString;
  endMonth?: DateString;
  dealerName?: string;
  drugCompanyName?: string;
}): Promise<void> {
  await axios.request({
    method: 'GET',
    url: '/v1/settlements/export-zip',
    params: options,
  });
}

/**
 * 정산 알림 전송 (선택된 정산건 관리자에게 이메일)
 * POST /v1/settlements/notify-admin
 */
export async function notifyAdminForSettlements(data: SettlementNotifyRequest): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/settlements/notify-admin',
    data,
  });
}

/**
 * 이의신청 알림 전송 (선택된 정산건 관리자에게 이메일)
 * POST /v1/settlements/notify-admin/objections
 */
export async function notifyAdminForObjections(data: SettlementNotifyRequest): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/settlements/notify-admin/objections',
    data,
  });
}

/**
 * 정산상세내역 목록 조회 (거래처별 합계)
 * GET /v1/settlements/partners
 */
export async function getSettlementPartnerSummary(options?: {
  settlementId?: number;
  institutionName?: string;
  businessNumber?: string;
  institutionCode?: string;
  settlementPartnerOrder?: 'INSTITUTION_NAME_ASC' | 'INSTITUTION_NAME_DESC' | 'TOTAL_AMOUNT_ASC' | 'TOTAL_AMOUNT_DESC';
  page?: number;
  size?: number;
}): Promise<PageSettlementPartnerResponse> {
  const response = await axios.request<PageSettlementPartnerResponse>({
    method: 'GET',
    url: '/v1/settlements/partners',
    params: options,
  });
  return response.data;
}

/**
 * 정산상세내역 (거래처별 합계) Excel 다운로드 (현재 페이지 기준)
 * GET /v1/settlements/partners/excel-download
 */
export function getDownloadSettlementPartnerSummaryExcel(options?: {
  settlementId?: number;
  institutionName?: string;
  businessNumber?: string;
  institutionCode?: string;
  page?: number;
  size?: number;
}): string {
  const baseUrl = '/v1/settlements/partners/excel-download';
  const paramsInit = Object.entries(options ?? {})
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => [key, String(value)]);
  const params = new URLSearchParams(paramsInit);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * 거래처별 제품 상세 목록 조회
 * GET /v1/settlements/partners/{settlementPartnerId}/products
 */
export async function getSettlementPartnerProducts(settlementPartnerId: number): Promise<SettlementPartnerProductResponse[]> {
  const response = await axios.request<SettlementPartnerProductResponse[]>({
    method: 'GET',
    url: `/v1/settlements/partners/${settlementPartnerId}/products`,
  });
  return response.data;
}

/**
 * 실적통계 조회
 * GET /v1/settlements/performance
 */
export async function getPerformanceStats(options?: {
  drugCompany?: string;
  companyName?: string;
  dealerName?: string;
  institutionName?: string;
  institutionCode?: string;
  startMonth?: DateString;
  endMonth?: DateString;
  page?: number;
  size?: number;
}): Promise<PagePerformanceStatsResponse> {
  const response = await axios.request<PagePerformanceStatsResponse>({
    method: 'GET',
    url: '/v1/settlements/performance',
    params: options,
  });
  return response.data;
}

/**
 * 정산내역 - 제약사별 집계
 * GET /v1/settlements/performance/by-drug-company
 */
export async function getPerformanceByDrugCompany(options?: {
  institutionCode?: string;
  startMonth?: DateString;
  endMonth?: DateString;
}): Promise<PerformanceStatsByDrugCompany[]> {
  const response = await axios.request<PerformanceStatsByDrugCompany[]>({
    method: 'GET',
    url: '/v1/settlements/performance/by-drug-company',
    params: options,
  });
  return response.data;
}

/**
 * 실적통계 - 제약사별 월별 집계
 * GET /v1/settlements/performance/by-drug-company/monthly
 */
export async function getPerformanceByDrugCompanyMonthly(options?: {
  institutionCode?: string;
  startMonth?: DateString;
  endMonth?: DateString;
}): Promise<PerformanceStatsByDrugCompanyMonthly[]> {
  const response = await axios.request<PerformanceStatsByDrugCompanyMonthly[]>({
    method: 'GET',
    url: '/v1/settlements/performance/by-drug-company/monthly',
    params: options,
  });
  return response.data;
}

/**
 * 실적통계 - 거래처별 집계
 * GET /v1/settlements/performance/by-institution
 */
export async function getPerformanceByInstitution(options?: {
  startMonth?: DateString;
  endMonth?: DateString;
}): Promise<PerformanceStatsByInstitution[]> {
  const response = await axios.request<PerformanceStatsByInstitution[]>({
    method: 'GET',
    url: '/v1/settlements/performance/by-institution',
    params: options,
  });
  return response.data;
}

/**
 * 실적통계 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/settlements/performance/excel-download
 */
export function getDownloadPerformanceExcel(options?: {
  drugCompany?: string;
  companyName?: string;
  dealerName?: string;
  institutionName?: string;
  institutionCode?: string;
  startMonth?: DateString;
  endMonth?: DateString;
  page?: number;
  size?: number;
}): string {
  const baseUrl = '/v1/settlements/performance/excel-download';
  const paramsInit = Object.entries(options ?? {})
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => [key, String(value)]);
  const params = new URLSearchParams(paramsInit);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * 실적통계 - prescriptionAmount 전체 합계
 * GET /v1/settlements/performance/total-prescription-amount
 */
export async function getPerformanceTotalPrescriptionAmount(options?: {
  drugCompany?: string;
  companyName?: string;
  dealerName?: string;
  institutionName?: string;
  startMonth?: DateString;
  endMonth?: DateString;
}): Promise<number> {
  const response = await axios.request<number>({
    method: 'GET',
    url: '/v1/settlements/performance/total-prescription-amount',
    params: options,
  });
  return response.data;
}

/**
 * 정산 엑셀 업로드
 * POST /v1/settlements/upload
 */
export async function uploadSettlementExcel(data: { file: File }): Promise<void> {
  const form = new FormData();
  form.append('file', data.file, data.file.name.normalize('NFC'));
  await axios.request({
    method: 'POST',
    url: '/v1/settlements/upload',
    data: form,
  });
}

/**
 * 정산내역 단건 조회
 * GET /v1/settlements/{id}
 */
export async function getSettlement(id: number): Promise<SettlementResponse> {
  const response = await axios.request<SettlementResponse>({
    method: 'GET',
    url: `/v1/settlements/${id}`,
  });
  return response.data;
}

/**
 * 최신 약관
 * GET /v1/terms/latest
 */
export async function getLatestTerms(): Promise<string> {
  const response = await axios.request<string>({
    method: 'GET',
    url: '/v1/terms/latest',
  });
  return response.data;
}

/**
 * 최신 개인정보처리방침
 * GET /v1/terms/privacy/latest
 */
export async function getLatestPrivacyPolicy(): Promise<string> {
  const response = await axios.request<string>({
    method: 'GET',
    url: '/v1/terms/privacy/latest',
  });
  return response.data;
}

/**
 * 버전별 개인정보처리방침
 * GET /v1/terms/privacy/{version}
 */
export async function getPrivacyPolicyByVersion(version: string): Promise<string> {
  const response = await axios.request<string>({
    method: 'GET',
    url: `/v1/terms/privacy/${version}`,
  });
  return response.data;
}

/**
 * 버전별 약관
 * GET /v1/terms/{version}
 */
export async function getTermsByVersion(version: string): Promise<string> {
  const response = await axios.request<string>({
    method: 'GET',
    url: `/v1/terms/${version}`,
  });
  return response.data;
}

/**
 * email 전송 테스트
 * GET /v1/test/email
 */
export async function testEmail(options?: { to?: string; subject?: string; body?: string }): Promise<void> {
  await axios.request({
    method: 'GET',
    url: '/v1/test/email',
    params: options,
  });
}

/**
 * 푸시 전송 테스트
 * GET /v1/test/push
 */
export async function testPush(options?: { token?: string }): Promise<void> {
  await axios.request({
    method: 'GET',
    url: '/v1/test/push',
    params: options,
  });
}

/**
 * 문자 전송 테스트
 * GET /v1/test/sms
 */
export async function tetSms(options?: { message?: string; phoneNumber?: string }): Promise<void> {
  await axios.request({
    method: 'GET',
    url: '/v1/test/sms',
    params: options,
  });
}
