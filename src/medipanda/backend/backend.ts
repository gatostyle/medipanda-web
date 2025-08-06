import axios from 'utils/axios';

export class DateTimeString extends String {
  public constructor(value: string | Date) {
    if (value instanceof Date) {
      value = value.toISOString();
    }

    super(value);
  }

  public toDate(): Date {
    return new Date(this.toString());
  }
}

export class DateString extends String {
  public constructor(value: string | Date) {
    if (value instanceof Date) {
      value = value.toISOString().split('T')[0];
    }

    super(value);
  }

  public toDate(): Date {
    return new Date(this.toString());
  }
}

export interface AdminCreateRequest {
  status: boolean;
  name: string;
  userId: string;
  password: string;
  email: string;
  phoneNumber: string;
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
  name: string | null;
  userId: string | null;
  password: string | null;
  email: string | null;
  phoneNumber: string | null;
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
}

export interface AttachedFileResponse {
  fileId: number;
  fileName: string;
  fileUrl: string;
}

export interface AttachmentResponse {
  s3fileId: number;
  fileUrl: string;
}

export interface BannerCreateRequest {
  title: string;
  linkUrl: string;
  status: 'VISIBLE' | 'HIDDEN';
  scope: 'ENTIRE' | 'CONTRACT' | 'NON_CONTRACT';
  position: string;
  displayOrder: number;
  startAt: DateTimeString;
  endAt: DateTimeString;
}

export interface BannerResponse {
  id: number;
  title: string;
  linkUrl: string;
  status: 'VISIBLE' | 'HIDDEN';
  scope: 'ENTIRE' | 'CONTRACT' | 'NON_CONTRACT';
  position: string;
  displayOrder: number;
  viewCount: number;
  clickCount: number;
  ctr: number;
  note: string | null;
  startAt: string;
  endAt: string;
  imageUrl: string;
}

export interface BannerUpdateRequest {
  title: string | null;
  linkUrl: string | null;
  status: ('VISIBLE' | 'HIDDEN') | null;
  scope: ('ENTIRE' | 'CONTRACT' | 'NON_CONTRACT') | null;
  position: string | null;
  displayOrder: number | null;
  startAt: DateTimeString | null;
  endAt: DateTimeString | null;
}

export interface BlindPostResponse {
  id: number;
  memberName: string;
  content: string;
  userId: string;
  nickname: string;
  likesCount: number;
  reportType: 'SPAM' | 'ABUSE' | 'ILLEGAL_CONTENT' | 'PERSONAL_INFORMATION' | 'OTHER';
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  postType: 'BOARD' | 'COMMENT';
  blindAt: string;
}

export interface BlindUpdateRequest {
  postId: number | null;
  commentId: number | null;
}

export interface BoardDetailsResponse {
  id: number;
  userId: string;
  name: string;
  memberType: 'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION';
  boardType: string;
  title: string;
  content: string;
  nickname: string;
  isBlind: boolean;
  likesCount: number;
  viewsCount: number;
  commentCount: number;
  isExposed: boolean;
  exposureRange: 'ALL' | 'CONTRACTED' | 'UNCONTRACTED';
  createdAt: string;
  children: BoardDetailsResponse[];
  reports: BoardReportResponse[];
  comments: CommentResponse[];
  attachments: AttachmentResponse[];
  noticeProperties: NoticeProperties | null;
}

export interface BoardMemberStatsResponse {
  name: string;
  id: number;
  userId: string;
  commentCount: number;
  phoneNumber: string;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  postCount: number;
  totalLikes: number;
  blindPostCount: number;
}

export interface BoardPostCreateRequest {
  boardType: 'ANONYMOUS' | 'MR_CSO_MATCHING' | 'NOTICE' | 'INQUIRY' | 'FAQ' | 'CSO_A_TO_Z' | 'EVENT' | 'SALES_AGENCY' | 'PRODUCT';
  userId: string;
  nickname: string;
  title: string;
  content: string;
  parentId: number | null;
  isExposed: boolean;
  editorFileIds: number[] | null;
  exposureRange: 'ALL' | 'CONTRACTED' | 'UNCONTRACTED';
  noticeProperties: NoticeProperties | null;
}

export interface BoardPostResponse {
  id: number;
  userId: string;
  name: string;
  memberType: 'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION';
  boardType: 'ANONYMOUS' | 'MR_CSO_MATCHING' | 'NOTICE' | 'INQUIRY' | 'FAQ' | 'CSO_A_TO_Z' | 'EVENT' | 'SALES_AGENCY' | 'PRODUCT';
  title: string;
  nickname: string;
  isBlind: boolean;
  likesCount: number;
  viewsCount: number;
  commentCount: number;
  createdAt: string;
  isExposed: boolean;
  exposureRange: 'ALL' | 'CONTRACTED' | 'UNCONTRACTED';
  noticeType:
    | ('PRODUCT_STATUS' | 'MANUFACTURING_SUSPENSION' | 'NEW_PRODUCT' | 'POLICY' | 'GENERAL' | 'ANONYMOUS_BOARD' | 'MR_CSO_MATCHING')
    | null;
}

export interface BoardPostUpdateRequest {
  title: string | null;
  content: string | null;
  isBlind: boolean | null;
  isExposed: boolean | null;
  exposureRange: ('ALL' | 'CONTRACTED' | 'UNCONTRACTED') | null;
  keepFileIds: number[];
  editorFileIds: number[] | null;
  noticeProperties: UpdateNoticeProperties | null;
}

export interface BoardReportResponse {
  id: number;
  userId: string;
  memberName: string;
  nickname: string;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  reportType: 'SPAM' | 'ABUSE' | 'ILLEGAL_CONTENT' | 'PERSONAL_INFORMATION' | 'OTHER';
  reportContent: string;
  reportDateTime: string;
}

export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface CommentCreateRequest {
  boardPostId: number;
  parentId: number | null;
  content: string;
}

export interface CommentMemberResponse {
  name: string;
  id: number;
  content: string;
  userId: string;
  commentType: 'COMMENT' | 'REPLY';
  createdAt: string;
  nickname: string;
  likesCount: number;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  isBlind: boolean;
}

export interface CommentResponse {
  id: number;
  userId: string;
  name: string;
  content: string;
  nickname: string;
  likesCount: number;
  isBlind: boolean;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  parentId: number | null;
  createdAt: string;
  modifiedAt: string;
}

export interface CommentUpdateRequest {
  id: number;
  content: string;
}

export interface EditorUploadResponse {
  s3FileId: number;
  fileName: string;
  fileUrl: string;
}

export interface EventBoardCreateRequest {
  startAt: string;
  endAt: string;
  description: string;
  videoUrl: string | null;
  note: string | null;
}

export interface EventBoardDetailsResponse {
  eventId: number;
  eventStartDate: number;
  eventEndDate: number;
  description: string;
  thumbnailUrl: string;
  videoUrl: string | null;
  note: string | null;
  boardPostDetail: BoardDetailsResponse;
}

export interface EventBoardSummaryResponse {
  id: number;
  title: string;
  thumbnailUrl: string;
  eventStartAt: string;
  eventEndAt: string;
  isExposed: boolean;
  viewCount: number;
  createdDate: string;
  eventStatus: 'IN_PROGRESS' | 'FINISHED';
}

export interface EventBoardUpdateRequest {
  startAt: string | null;
  endAt: string | null;
  description: string | null;
  videoUrl: string | null;
  note: string | null;
}

export interface ExpenseReportResponse {
  reportId: number;
  userId: string | null;
  companyName: string | null;
  productName: string | null;
  institutionType: string;
  reportType: 'SAMPLE_PROVIDE' | 'PRODUCT_BRIEFING_MULTI' | 'PRODUCT_BRIEFING_SINGLE';
  status: 'PENDING' | 'COMPLETED';
  eventStartAt: string | null;
  eventEndAt: string | null;
  supportAmount: number;
}

export interface FcmTokenRequest {
  fcmToken: string;
}

export interface HospitalResponse {
  id: number;
  name: string;
  sido: string;
  sigungu: string;
  address: string;
  scheduledOpenDate: string | null;
  source: string | null;
}

export interface InstitutionInfo {
  name: string;
  code: string;
}

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MarketingAgreements {
  sms: boolean;
  email: boolean;
  push: boolean;
}

export interface MedicalPersonInfo {
  name: string;
  employeeCode: string;
}

export interface MedicalPersonWithSignature {
  name: string;
  employeeCode: string;
  signatureFile: AttachedFileResponse;
}

export interface MemberDetailsResponse {
  id: number;
  userId: string;
  name: string;
  gender: ('MALE' | 'FEMALE') | null;
  phoneNumber: string;
  birthDate: string;
  email: string;
  partnerContractStatus: 'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION';
  marketingAgreements: MarketingAgreements;
  referralCode: string | null;
  csoCertUrl: string | null;
  registrationDate: string;
  lastLoginDate: string;
  note: string | null;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface MemberResponse {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string;
  birthDate: string;
  email: string;
  partnerContractStatus: 'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION';
  marketingConsent: boolean;
  registrationDate: string;
  lastLoginDate: string;
  hasCsoCert: boolean;
  accountStatus: 'ACTIVATED' | 'BLOCKED' | 'DELETED';
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  companyName: string | null;
  createdAt: string;
}

export interface MemberSignupRequest {
  userId: string;
  password: string;
  name: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
  nickname: string | null;
  referralCode: string | null;
  marketingAgreement: MarketingAgreements;
}

export interface MemberUpdateRequest {
  password: string | null;
  name: string | null;
  birthDate: string | null;
  phoneNumber: string | null;
  email: string | null;
  nickname: string | null;
  referralCode: string | null;
  note: string | null;
  marketingAgreement: MarketingAgreements | null;
}

export interface NoteUpdateItem {
  userId: string;
  note: string | null;
}

export interface NoticeProperties {
  noticeType: 'PRODUCT_STATUS' | 'MANUFACTURING_SUSPENSION' | 'NEW_PRODUCT' | 'POLICY' | 'GENERAL' | 'ANONYMOUS_BOARD' | 'MR_CSO_MATCHING';
  drugCompany: string | null;
  fixedTop: boolean;
}

export interface OcrOriginalItem {
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  baseFeeRate: number;
  feeAmount: number;
  note: string | null;
}

export interface PageBannerResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: BannerResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageBlindPostResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: BlindPostResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageBoardMemberStatsResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: BoardMemberStatsResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageBoardPostResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: BoardPostResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageCommentMemberResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: CommentMemberResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageEventBoardSummaryResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: EventBoardSummaryResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageExpenseReportResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: ExpenseReportResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageHospitalResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: HospitalResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageMemberResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: MemberResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PagePartnerResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: PartnerResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PagePrescriptionPartnerResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: PrescriptionPartnerResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PagePrescriptionResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: PrescriptionResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageProductSummaryResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: ProductSummaryResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageSalesAgencyProductApplicantResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: SalesAgencyProductApplicantResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageSalesAgencyProductSummaryResponse {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: SalesAgencyProductSummaryResponse[];
  number: number;
  sort: SortObject;
  numberOfElements: number;
  pageable: PageableObject;
  empty: boolean;
}

export interface PageableObject {
  offset: number;
  sort: SortObject;
  paged: boolean;
  unpaged: boolean;
  pageSize: number;
  pageNumber: number;
}

export interface PartnerContractDetailsResponse {
  contractType: 'INDIVIDUAL' | 'ORGANIZATION';
  companyName: string;
  businessNumber: string;
  bankName: string;
  accountNumber: string;
  contractDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  fileUrls: {
    [key: string]: string;
  };
}

export interface PartnerContractRequest {
  contractType: 'INDIVIDUAL' | 'ORGANIZATION';
  companyName: string;
  businessNumber: string;
  bankName: string;
  accountNumber: string;
}

export interface PartnerContractUpdateRequest {
  contractType: ('INDIVIDUAL' | 'ORGANIZATION') | null;
  companyName: string | null;
  businessNumber: string | null;
  bankName: string | null;
  accountNumber: string | null;
}

export interface PartnerCreateRequest {
  drugCompany: string;
  companyName: string;
  contractType: 'CONTRACT' | 'NON_CONTRACT';
  institutionCode: string;
  institutionName: string;
  businessNumber: string;
  medicalDepartment: string | null;
  pharmacyName: string | null;
  pharmacyAddress: string | null;
  pharmacyStatus: 'NORMAL' | 'CLOSED' | 'DELETED' | 'NONE';
  note: string | null;
}

export interface PartnerResponse {
  id: number;
  drugCompany: string;
  companyName: string;
  contractType: 'CONTRACT' | 'NON_CONTRACT';
  institutionCode: string;
  institutionName: string;
  businessNumber: string;
  medicalDepartment: string | null;
  hasPharmacy: boolean;
  pharmacyName: string | null;
  pharmacyAddress: string | null;
  pharmacyStatus: ('NORMAL' | 'CLOSED' | 'DELETED' | 'NONE') | null;
  note: string | null;
}

export interface PartnerUpdateRequest {
  drugCompany: string | null;
  companyName: string | null;
  contractType: ('CONTRACT' | 'NON_CONTRACT') | null;
  institutionCode: string | null;
  institutionName: string | null;
  businessNumber: string | null;
  medicalDepartment: string | null;
  pharmacyName: string | null;
  pharmacyAddress: string | null;
  pharmacyStatus: ('NORMAL' | 'CLOSED' | 'DELETED' | 'NONE') | null;
  note: string | null;
}

export interface PrescriptionCreateRequest {
  dealerId: number;
  partnerId: number;
  prescriptionMonth: DateTimeString;
  settlementMonth: DateTimeString;
}

export interface PrescriptionPartnerProductCreateRequest {
  prescriptionPartnerId: number;
  items: PrescriptionProductItem[];
}

export interface PrescriptionPartnerProductResponse {
  id: number;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  baseFeeRate: number;
  feeAmount: number;
  note: string | null;
}

export interface PrescriptionPartnerResponse {
  id: number;
  companyName: string;
  drugCompany: string;
  institutionCode: string;
  prescriptionMonth: string;
  settlementMonth: string;
  inputDate: string;
  amount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dealerName: string;
  partnerName: string;
  businessNumber: string;
}

export interface PrescriptionProductItem {
  productCode: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  baseFeeRate: number;
  feeAmount: number;
  note: string | null;
  ocrItem: OcrOriginalItem | null;
}

export interface PrescriptionResponse {
  id: number;
  dealerId: number;
  userId: string;
  companyName: string;
  dealerName: string;
  prescriptionMonth: string;
  settlementMonth: string;
  submittedAt: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  checkedAt: string | null;
}

export interface ProductBriefingMultiCreateRequest {
  productId: number;
  institutions: InstitutionInfo[];
  transportationFee: number;
  giftFee: number;
  accommodationFee: number;
  mealFee: number;
  location: string;
  startedAt: DateTimeString;
  endedAt: DateTimeString;
  isJoint: boolean;
}

export interface ProductBriefingMultiDetailResponse {
  reportId: number;
  reportType: 'SAMPLE_PROVIDE' | 'PRODUCT_BRIEFING_MULTI' | 'PRODUCT_BRIEFING_SINGLE';
  productName: string;
  productCode: string;
  institutions: InstitutionInfo[];
  transportationFee: number;
  giftFee: number;
  accommodationFee: number;
  mealFee: number;
  location: string;
  startedAt: string;
  endedAt: string;
  isJoint: boolean;
  attachedFiles: AttachedFileResponse[];
  status: 'PENDING' | 'COMPLETED';
}

export interface ProductBriefingMultiUpdateRequest {
  location: string | null;
  startedAt: DateTimeString | null;
  endedAt: DateTimeString | null;
  isJoint: boolean | null;
  transportationFee: number | null;
  giftFee: number | null;
  accommodationFee: number | null;
  mealFee: number | null;
  institutions: InstitutionInfo[] | null;
  existFileIds: number[];
}

export interface ProductBriefingSingleCreateRequest {
  productId: number;
  institutionName: string;
  institutionCode: string;
  supportAmount: number;
  location: string;
  eventAt: DateTimeString;
  isJoint: boolean;
  medicalPersons: MedicalPersonInfo[];
}

export interface ProductBriefingSingleDetailResponse {
  reportId: number;
  productName: string;
  productCode: string;
  institutionName: string;
  institutionCode: string;
  supportAmount: number;
  location: string;
  eventAt: string;
  isJoint: boolean;
  medicalPersons: MedicalPersonWithSignature[];
  attachedFiles: AttachedFileResponse[];
  status: 'PENDING' | 'COMPLETED';
}

export interface ProductBriefingSingleUpdateRequest {
  institutionName: string | null;
  institutionCode: string | null;
  supportAmount: number | null;
  location: string | null;
  eventAt: DateTimeString | null;
  isJoint: boolean | null;
  medicalPersons: MedicalPersonInfo[] | null;
  existFileIds: number[];
}

export interface ProductDetailsResponse {
  manufacturer: string | null;
  productName: string | null;
  composition: string | null;
  price: number | null;
  priceUnit: 'KRW' | 'USD' | 'EUR';
  feeRate: number | null;
  changedFeeRate: number | null;
  changedMonth: string | null;
  productCode: string | null;
  isPromotion: boolean | null;
  isOutOfStock: boolean | null;
  isStopSelling: boolean | null;
  isAcquisition: boolean | null;
  note: string | null;
  alternativeProducts: string[];
  boardDetailsResponse: BoardDetailsResponse;
}

export interface ProductExtraInfoRequest {
  manufacturer: string | null;
  productName: string | null;
  composition: string | null;
  productCode: string;
  changedFeeRate: string | null;
  changedMonth: string | null;
  priceUnit: 'KRW' | 'USD' | 'EUR';
  feeRate: string | null;
  price: number | null;
  note: string | null;
  detailInfo: string | null;
  isPromotion: boolean | null;
  isOutOfStock: boolean | null;
  isStopSelling: boolean | null;
  isAcquisition: boolean | null;
}

export interface ProductSummaryResponse {
  id: number;
  productName: string | null;
  composition: string | null;
  productCode: string;
  manufacturerName: string | null;
  note: string | null;
  price: number | null;
  feeRate: number | null;
  changedFeeRate: number | null;
  changedMonth: string | null;
  isAcquisition: boolean | null;
  isPromotion: boolean | null;
  isOutOfStock: boolean | null;
  isStopSelling: boolean | null;
}

export interface RefreshTokenRequest {
  userId: string;
  refreshToken: string;
}

export interface ReportCreateRequest {
  postId: number | null;
  commentId: number | null;
  reportType: 'SPAM' | 'ABUSE' | 'ILLEGAL_CONTENT' | 'PERSONAL_INFORMATION' | 'OTHER';
  reportContent: string;
}

export interface SalesAgencyProductApplicantResponse {
  id: number;
  userId: string;
  memberName: string;
  phoneNumber: string;
  appliedDate: string;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  note: string | null;
}

export interface SalesAgencyProductCreateRequest {
  startAt: string;
  endAt: string;
  productName: string;
  clientName: string;
  contractDate: string;
  quantity: number;
  videoUrl: string | null;
  note: string | null;
}

export interface SalesAgencyProductDetailsResponse {
  productId: number;
  clientName: string;
  productName: string;
  startDate: string;
  endDate: string;
  contractDate: string;
  thumbnailUrl: string;
  videoUrl: string | null;
  note: string | null;
  quantity: number;
  price: number;
  boardPostDetail: BoardDetailsResponse;
}

export interface SalesAgencyProductNoteUpdateRequest {
  updates: NoteUpdateItem[];
}

export interface SalesAgencyProductSummaryResponse {
  id: number;
  clientName: string;
  productName: string;
  price: number;
  contractDate: string;
  isExposed: boolean;
  startAt: string;
  endAt: string;
  appliedCount: number;
  quantity: number;
  thumbnailUrl: string | null;
}

export interface SalesAgencyProductUpdateRequest {
  startAt: string | null;
  endAt: string | null;
  productName: string | null;
  clientName: string | null;
  contractDate: string | null;
  videoUrl: string | null;
  quantity: number | null;
  note: string | null;
}

export interface SampleProvideReportCreateRequest {
  productId: number;
  packCount: number;
  provideCount: number;
  providedAt: DateTimeString;
  institutionName: string;
  institutionCode: string;
}

export interface SampleProvideReportDetailResponse {
  reportId: number;
  reportType: 'SAMPLE_PROVIDE' | 'PRODUCT_BRIEFING_MULTI' | 'PRODUCT_BRIEFING_SINGLE';
  productName: string;
  productCode: string;
  packCount: number;
  provideCount: number;
  institutionName: string;
  institutionCode: string;
  providedAt: string;
  attachedFiles: AttachedFileResponse[];
  status: 'PENDING' | 'COMPLETED';
}

export interface SampleProvideReportUpdateRequest {
  packCount: number | null;
  provideCount: number | null;
  institutionName: string | null;
  institutionCode: string | null;
  providedAt: DateTimeString | null;
  existFileIds: number[];
}

export interface SortObject {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface UpdateNoticeProperties {
  noticeType:
    | ('PRODUCT_STATUS' | 'MANUFACTURING_SUSPENSION' | 'NEW_PRODUCT' | 'POLICY' | 'GENERAL' | 'ANONYMOUS_BOARD' | 'MR_CSO_MATCHING')
    | null;
  drugCompany: string | null;
  fixedTop: boolean | null;
}

/**
 * PUT /v1/products/export-to-root-tsv
 */
export async function exportAll(): Promise<string> {
  const response = await axios.request<string>({
    method: 'PUT',
    url: '/v1/products/export-to-root-tsv'
  });
  return response.data;
}

/**
 * 거래선 상세 조회
 * GET /v1/partners/{id}
 */
export async function getPartnerDetails(id: number): Promise<PartnerResponse> {
  const response = await axios.request<PartnerResponse>({
    method: 'GET',
    url: `/v1/partners/${id}`
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
    data
  });
}

/**
 * 거래선 삭제 (soft delete)
 * DELETE /v1/partners/{id}
 */
export async function deletePartner(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/partners/${id}`
  });
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
  filterDeleted?: boolean;
  page?: number;
  size?: number;
}): Promise<PageCommentMemberResponse> {
  const response = await axios.request<PageCommentMemberResponse>({
    method: 'GET',
    url: '/v1/comments',
    params: options
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
    data
  });
  return response.data;
}

/**
 * 댓글 블라인드 상태 설정/해제
 * PUT /v1/comments/{id}/toggle-blind
 */
export async function toggleBlindStatus(id: number): Promise<boolean> {
  const response = await axios.request<boolean>({
    method: 'PUT',
    url: `/v1/comments/${id}/toggle-blind`
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
  }
): Promise<BoardDetailsResponse> {
  const response = await axios.request<BoardDetailsResponse>({
    method: 'GET',
    url: `/v1/boards/${id}`,
    params: options
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
    updateRequest: BoardPostUpdateRequest;
    newFiles?: File[];
  }
): Promise<string> {
  const response = await axios.request<string>({
    method: 'PUT',
    url: `/v1/boards/${id}`,
    data
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
    url: `/v1/boards/${id}`
  });
}

/**
 * 게시글 블라인드 상태 설정/해제
 * PUT /v1/boards/{id}/toggle-blind
 */
export async function toggleBlindStatus_1(id: number): Promise<boolean> {
  const response = await axios.request<boolean>({
    method: 'PUT',
    url: `/v1/boards/${id}/toggle-blind`
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
    data
  });
}

/**
 * 영업대행 상품 목록 조회
 * GET /v1/sales-agency-products
 */
export async function getSalesAgencyProducts(options?: {
  productName?: string;
  clientName?: string;
  startAt?: DateString;
  endAt?: DateString;
  page?: number;
  size?: number;
}): Promise<PageSalesAgencyProductSummaryResponse> {
  const response = await axios.request<PageSalesAgencyProductSummaryResponse>({
    method: 'GET',
    url: '/v1/sales-agency-products',
    params: options
  });
  return response.data;
}

/**
 * 영업 대행 상품 게시글 생성
 * POST /v1/sales-agency-products
 */
export async function createSalesAgencyProductBoard(data: {
  boardPostCreateRequest: BoardPostCreateRequest;
  salesAgencyProductCreateRequest: SalesAgencyProductCreateRequest;
  thumbnail: File;
  files?: File[];
}): Promise<string> {
  const form = new FormData();
  if (data.boardPostCreateRequest !== undefined && data.boardPostCreateRequest !== null) {
    form.append('boardPostCreateRequest', new Blob([JSON.stringify(data.boardPostCreateRequest)], { type: 'application/json' }));
  }
  if (data.salesAgencyProductCreateRequest !== undefined && data.salesAgencyProductCreateRequest !== null) {
    form.append(
      'salesAgencyProductCreateRequest',
      new Blob([JSON.stringify(data.salesAgencyProductCreateRequest)], { type: 'application/json' })
    );
  }
  if (data.thumbnail !== undefined && data.thumbnail !== null) {
    form.append('thumbnail', data.thumbnail);
  }
  if (data.files !== undefined && data.files !== null) {
    for (const v of data.files) {
      form.append('files', v);
    }
  }
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/sales-agency-products',
    data: form
  });
  return response.data;
}

/**
 * 영업대행 상품 신청
 * POST /v1/sales-agency-products/{id}/apply
 */
export async function applyProduct(id: number): Promise<void> {
  await axios.request({
    method: 'POST',
    url: `/v1/sales-agency-products/${id}/apply`
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
    data
  });
  return response.data;
}

/**
 * POST /v1/products/upload-kims-from-s3
 */
export async function uploadFromS3(options?: { prefix?: string }): Promise<string> {
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/products/upload-kims-from-s3',
    params: options
  });
  return response.data;
}

/**
 * 제품 엑셀 업로드
 * POST /v1/products/product-extra-info/upload
 */
export async function uploadProductExtraInfo(data: { file: File }): Promise<void> {
  const form = new FormData();
  if (data.file !== undefined && data.file !== null) {
    form.append('file', data.file);
  }
  await axios.request({
    method: 'POST',
    url: '/v1/products/product-extra-info/upload',
    data: form
  });
}

/**
 * 제품 추가 정보 생성
 * POST /v1/products/extra-info
 */
export async function createProductExtraInfo(data: {
  boardPostCreateRequest: BoardPostCreateRequest;
  productExtraInfoCreateRequest: ProductExtraInfoRequest;
  files?: File[];
}): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/products/extra-info',
    data
  });
}

/**
 * EDI ZIP 파일 업로드 (대량 업로드)
 * POST /v1/prescriptions/zip
 */
export async function uploadEdiZip(data: { prescriptionMonth: string; settlementMonth: string; file: File }): Promise<void> {
  const form = new FormData();
  if (data.prescriptionMonth !== undefined && data.prescriptionMonth !== null) {
    form.append('prescriptionMonth', data.prescriptionMonth as any);
  }
  if (data.settlementMonth !== undefined && data.settlementMonth !== null) {
    form.append('settlementMonth', data.settlementMonth as any);
  }
  if (data.file !== undefined && data.file !== null) {
    form.append('file', data.file);
  }
  await axios.request({
    method: 'POST',
    url: '/v1/prescriptions/zip',
    data: form
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
    data
  });
}

/**
 * 거래처별 EDI 파일 업로드
 * POST /v1/prescriptions/partner-files
 */
export async function uploadPartnerEdiFiles(data: { request: PrescriptionCreateRequest; files: File[] }): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.files !== undefined && data.files !== null) {
    for (const v of data.files) {
      form.append('files', v);
    }
  }
  await axios.request({
    method: 'POST',
    url: '/v1/prescriptions/partner-files',
    data: form
  });
}

/**
 * 거래선 조회
 * GET /v1/partners
 */
export async function getPartners(options?: {
  companyName?: string;
  institutionName?: string;
  institutionCode?: string;
  contractType?: 'CONTRACT' | 'NON_CONTRACT';
  page?: number;
  size?: number;
}): Promise<PagePartnerResponse> {
  const response = await axios.request<PagePartnerResponse>({
    method: 'GET',
    url: '/v1/partners',
    params: options
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
    data
  });
}

/**
 * 거래선 엑셀 업로드
 * POST /v1/partners/upload
 */
export async function uploadPartnersExcel(data: { file: File }): Promise<void> {
  const form = new FormData();
  if (data.file !== undefined && data.file !== null) {
    form.append('file', data.file);
  }
  await axios.request({
    method: 'POST',
    url: '/v1/partners/upload',
    data: form
  });
}

/**
 * 파트너 계약 신청
 * POST /v1/partner-contracts
 */
export async function applyContract(data: {
  request: PartnerContractRequest;
  business_registration: File;
  subcontract_agreement: File;
  cso_certificate: File;
  education_certificate: File;
}): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.business_registration !== undefined && data.business_registration !== null) {
    form.append('business_registration', data.business_registration);
  }
  if (data.subcontract_agreement !== undefined && data.subcontract_agreement !== null) {
    form.append('subcontract_agreement', data.subcontract_agreement);
  }
  if (data.cso_certificate !== undefined && data.cso_certificate !== null) {
    form.append('cso_certificate', data.cso_certificate);
  }
  if (data.education_certificate !== undefined && data.education_certificate !== null) {
    form.append('education_certificate', data.education_certificate);
  }
  await axios.request({
    method: 'POST',
    url: '/v1/partner-contracts',
    data: form
  });
}

/**
 * 파트너 계약 거절
 * POST /v1/partner-contracts/{contractId}/reject
 */
export async function rejectContract(contractId: number): Promise<void> {
  await axios.request({
    method: 'POST',
    url: `/v1/partner-contracts/${contractId}/reject`
  });
}

/**
 * 파트너 계약 승인
 * POST /v1/partner-contracts/{contractId}/approve
 */
export async function approveContract(contractId: number): Promise<void> {
  await axios.request({
    method: 'POST',
    url: `/v1/partner-contracts/${contractId}/approve`
  });
}

/**
 * 파트너 계약 수정
 * POST /v1/partner-contracts/update
 */
export async function updateContract(data: {
  request: PartnerContractUpdateRequest;
  business_registration?: File;
  subcontract_agreement?: File;
  cso_certificate?: File;
  education_certificate?: File;
}): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.business_registration !== undefined && data.business_registration !== null) {
    form.append('business_registration', data.business_registration);
  }
  if (data.subcontract_agreement !== undefined && data.subcontract_agreement !== null) {
    form.append('subcontract_agreement', data.subcontract_agreement);
  }
  if (data.cso_certificate !== undefined && data.cso_certificate !== null) {
    form.append('cso_certificate', data.cso_certificate);
  }
  if (data.education_certificate !== undefined && data.education_certificate !== null) {
    form.append('education_certificate', data.education_certificate);
  }
  await axios.request({
    method: 'POST',
    url: '/v1/partner-contracts/update',
    data: form
  });
}

/**
 * 회원 목록 조회
 * GET /v1/members
 */
export async function getUserMembers(options?: {
  memberId?: number;
  userId?: string;
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
    params: options
  });
  return response.data;
}

/**
 * 회원가입
 * POST /v1/members
 */
export async function signup(data: { request: MemberSignupRequest; file?: File }): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.file !== undefined && data.file !== null) {
    form.append('file', data.file);
  }
  await axios.request({
    method: 'POST',
    url: '/v1/members',
    data: form
  });
}

/**
 * FCM 토큰 등록
 * POST /v1/members/fcm-token
 */
export async function registerFcmToken(data: FcmTokenRequest): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/members/fcm-token',
    data
  });
}

/**
 * 관리자 목록 조회
 * GET /v1/members/admins
 */
export async function getAdminMembers(options?: { page?: number; size?: number }): Promise<PageMemberResponse> {
  const response = await axios.request<PageMemberResponse>({
    method: 'GET',
    url: '/v1/members/admins',
    params: options
  });
  return response.data;
}

/**
 * admin 가입
 * POST /v1/members/admins
 */
export async function signupByAdmin(data: AdminCreateRequest): Promise<void> {
  await axios.request({
    method: 'POST',
    url: '/v1/members/admins',
    data
  });
}

/**
 * 엑셀 파일 업로드
 * POST /v1/hospitals/upload
 */
export async function uploadHospitalExcel(data: { file: File }): Promise<string> {
  const form = new FormData();
  if (data.file !== undefined && data.file !== null) {
    form.append('file', data.file);
  }
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/hospitals/upload',
    data: form
  });
  return response.data;
}

/**
 * 지출보고 생성 - 견본품 제공
 * POST /v1/expense-reports/sample-provide
 */
export async function createSampleProvideReport(data: {
  request: SampleProvideReportCreateRequest;
  attachmentFiles?: File[];
}): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.attachmentFiles !== undefined && data.attachmentFiles !== null) {
    for (const v of data.attachmentFiles) {
      form.append('attachmentFiles', v);
    }
  }
  await axios.request({
    method: 'POST',
    url: '/v1/expense-reports/sample-provide',
    data: form
  });
}

/**
 * 지출보고 생성 - 제품설명회(개별기관)
 * POST /v1/expense-reports/product-briefing/single
 */
export async function createProductBriefingSingleReport(data: {
  request: ProductBriefingSingleCreateRequest;
  signatureFiles: File[];
  attachmentFiles?: File[];
}): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.signatureFiles !== undefined && data.signatureFiles !== null) {
    for (const v of data.signatureFiles) {
      form.append('signatureFiles', v);
    }
  }
  if (data.attachmentFiles !== undefined && data.attachmentFiles !== null) {
    for (const v of data.attachmentFiles) {
      form.append('attachmentFiles', v);
    }
  }
  await axios.request({
    method: 'POST',
    url: '/v1/expense-reports/product-briefing/single',
    data: form
  });
}

/**
 * 지출보고 생성 - 제품설명회(복수기관)
 * POST /v1/expense-reports/product-briefing/multi
 */
export async function createProductBriefingMultiReport(data: {
  request: ProductBriefingMultiCreateRequest;
  attachmentFiles?: File[];
}): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.attachmentFiles !== undefined && data.attachmentFiles !== null) {
    for (const v of data.attachmentFiles) {
      form.append('attachmentFiles', v);
    }
  }
  await axios.request({
    method: 'POST',
    url: '/v1/expense-reports/product-briefing/multi',
    data: form
  });
}

/**
 * 이벤트 리스트 조회
 * GET /v1/events
 */
export async function getEventBoards(options?: {
  status?: 'IN_PROGRESS' | 'FINISHED';
  title?: string;
  startAt?: DateString;
  endAt?: DateString;
  page?: number;
  size?: number;
}): Promise<PageEventBoardSummaryResponse> {
  const response = await axios.request<PageEventBoardSummaryResponse>({
    method: 'GET',
    url: '/v1/events',
    params: options
  });
  return response.data;
}

/**
 * 이벤트 게시글 생성
 * POST /v1/events
 */
export async function createEventBoard(data: {
  request: BoardPostCreateRequest;
  eventRequest: EventBoardCreateRequest;
  thumbnail: File;
  files?: File[];
}): Promise<string> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.eventRequest !== undefined && data.eventRequest !== null) {
    form.append('eventRequest', new Blob([JSON.stringify(data.eventRequest)], { type: 'application/json' }));
  }
  if (data.thumbnail !== undefined && data.thumbnail !== null) {
    form.append('thumbnail', data.thumbnail);
  }
  if (data.files !== undefined && data.files !== null) {
    for (const v of data.files) {
      form.append('files', v);
    }
  }
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/events',
    data: form
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
    data
  });
  return response.data;
}

/**
 * POST /v1/comments/{id}/like
 */
export async function toggleLike(id: number): Promise<void> {
  await axios.request({
    method: 'POST',
    url: `/v1/comments/${id}/like`
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
}): Promise<PageBoardPostResponse> {
  const response = await axios.request<PageBoardPostResponse>({
    method: 'GET',
    url: '/v1/boards',
    params: options
  });
  return response.data;
}

/**
 * 게시글 작성
 * POST /v1/boards
 */
export async function createBoardPost(data: { request: BoardPostCreateRequest; files?: File[] }): Promise<string> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.files !== undefined && data.files !== null) {
    for (const v of data.files) {
      form.append('files', v);
    }
  }
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/boards',
    data: form
  });
  return response.data;
}

/**
 * 좋아요 누르기/해제
 * POST /v1/boards/{id}/like
 */
export async function toggleLike_1(id: number): Promise<void> {
  await axios.request({
    method: 'POST',
    url: `/v1/boards/${id}/like`
  });
}

/**
 * 에디터 파일 업로드 API
 * POST /v1/boards/uploads
 */
export async function uploadEditorFile(data: { file: File }): Promise<EditorUploadResponse> {
  const form = new FormData();
  if (data.file !== undefined && data.file !== null) {
    form.append('file', data.file);
  }
  const response = await axios.request<EditorUploadResponse>({
    method: 'POST',
    url: '/v1/boards/uploads',
    data: form
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
  startAt?: DateTimeString;
  endAt?: DateTimeString;
  bannerTitle?: string;
  bannerStatus?: 'VISIBLE' | 'HIDDEN';
}): Promise<PageBannerResponse> {
  const response = await axios.request<PageBannerResponse>({
    method: 'GET',
    url: '/v1/banners',
    params: options
  });
  return response.data;
}

/**
 * 배너 생성
 * POST /v1/banners
 */
export async function createBanner(data: { request: BannerCreateRequest; imageFile: File }): Promise<string> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.imageFile !== undefined && data.imageFile !== null) {
    form.append('imageFile', data.imageFile);
  }
  const response = await axios.request<string>({
    method: 'POST',
    url: '/v1/banners',
    data: form
  });
  return response.data;
}

/**
 * 휴대폰 인증번호 확인
 * POST /v1/auth/verification-code/verify/{userId}
 */
export async function verifyCode(
  userId: string,
  options?: {
    verificationCode?: string;
  }
): Promise<boolean> {
  const response = await axios.request<boolean>({
    method: 'POST',
    url: `/v1/auth/verification-code/verify/${userId}`,
    params: options
  });
  return response.data;
}

/**
 * 휴대폰 인증번호 전송
 * POST /v1/auth/verification-code/send/{userId}
 */
export async function sendVerificationCode(userId: string): Promise<string> {
  const response = await axios.request<string>({
    method: 'POST',
    url: `/v1/auth/verification-code/send/${userId}`
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
    data
  });
  return response.data;
}

/**
 * 로그인
 * POST /v1/auth/login
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await axios.request<LoginResponse>({
    method: 'POST',
    url: '/v1/auth/login',
    data
  });
  return response.data;
}

/**
 * 영업대행 상품 상세 조회
 * GET /v1/sales-agency-products/{id}
 */
export async function getSalesAgencyProductDetails(id: number): Promise<SalesAgencyProductDetailsResponse> {
  const response = await axios.request<SalesAgencyProductDetailsResponse>({
    method: 'GET',
    url: `/v1/sales-agency-products/${id}`
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
    salesAgencyProductUpdateRequest?: SalesAgencyProductUpdateRequest;
    thumbnail?: File;
    newFiles?: File[];
  }
): Promise<void> {
  const form = new FormData();
  if (data.boardPostUpdateRequest !== undefined && data.boardPostUpdateRequest !== null) {
    form.append('boardPostUpdateRequest', new Blob([JSON.stringify(data.boardPostUpdateRequest)], { type: 'application/json' }));
  }
  if (data.salesAgencyProductUpdateRequest !== undefined && data.salesAgencyProductUpdateRequest !== null) {
    form.append(
      'salesAgencyProductUpdateRequest',
      new Blob([JSON.stringify(data.salesAgencyProductUpdateRequest)], { type: 'application/json' })
    );
  }
  if (data.thumbnail !== undefined && data.thumbnail !== null) {
    form.append('thumbnail', data.thumbnail);
  }
  if (data.newFiles !== undefined && data.newFiles !== null) {
    for (const v of data.newFiles) {
      form.append('newFiles', v);
    }
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/sales-agency-products/${id}`,
    data: form
  });
}

/**
 * 영업대행 상품 신청자 비고 일괄 수정
 * PATCH /v1/sales-agency-products/applicants/notes
 */
export async function updateApplicantNotes(data: SalesAgencyProductNoteUpdateRequest): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: '/v1/sales-agency-products/applicants/notes',
    data
  });
}

/**
 * 제품 추가 정보 update
 * PATCH /v1/products/{id}/extra-info
 */
export async function updateProductExtraInfo(
  id: number,
  data: {
    boardPostUpdateRequest: BoardPostUpdateRequest;
    productExtraInfoCreateRequest: ProductExtraInfoRequest;
    newFiles?: File[];
  }
): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/products/${id}/extra-info`,
    data
  });
}

/**
 * 제품 정보 delete
 * DELETE /v1/products/{id}/extra-info
 */
export async function updateProductExtraInfo_1(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/products/${id}/extra-info`
  });
}

/**
 * 처방 접수 관리자 확인
 * PATCH /v1/prescriptions/{id}/confirm
 */
export async function confirmPrescription(id: number): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/prescriptions/${id}/confirm`
  });
}

/**
 * 처방 입력 승인
 * PATCH /v1/prescriptions/partners/{prescriptionPartnerId}/complete
 */
export async function completePrescriptionPartner(prescriptionPartnerId: number): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}/complete`
  });
}

/**
 * 회원 정보 수정
 * PATCH /v1/members/{userId}
 */
export async function updateMember(
  userId: string,
  data: {
    request: MemberUpdateRequest;
    file?: File;
  }
): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.file !== undefined && data.file !== null) {
    form.append('file', data.file);
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/members/${userId}`,
    data: form
  });
}

/**
 * 회원 탈퇴
 * DELETE /v1/members/{userId}
 */
export async function deleteMember(userId: string): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/members/${userId}`
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
    data
  });
}

/**
 * 닉네임 변경
 * PATCH /v1/members/{userId}/nickname
 */
export async function updateNickname(
  userId: string,
  options?: {
    nickname?: string;
  }
): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/members/${userId}/nickname`,
    params: options
  });
}

/**
 * CSO 신고증 승인/반려 처리
 * PATCH /v1/members/{userId}/cso-approval
 */
export async function approveOrRejectCso(
  userId: string,
  options?: {
    isApproved?: boolean;
  }
): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `/v1/members/${userId}/cso-approval`,
    params: options
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
    data
  });
}

/**
 * 지출보고 조회 - 견본품 제공
 * GET /v1/expense-reports/sample-provide/{id}
 */
export async function getSampleProvideReport(id: number): Promise<SampleProvideReportDetailResponse> {
  const response = await axios.request<SampleProvideReportDetailResponse>({
    method: 'GET',
    url: `/v1/expense-reports/sample-provide/${id}`
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
    request: SampleProvideReportUpdateRequest;
    newFiles?: File[];
  }
): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.newFiles !== undefined && data.newFiles !== null) {
    for (const v of data.newFiles) {
      form.append('newFiles', v);
    }
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/expense-reports/sample-provide/${id}`,
    data: form
  });
}

/**
 * 지출보고 조회 - 제품설명회(개별기관)
 * GET /v1/expense-reports/product-briefing/single/{id}
 */
export async function getProductBriefingSingleReport(id: number): Promise<ProductBriefingSingleDetailResponse> {
  const response = await axios.request<ProductBriefingSingleDetailResponse>({
    method: 'GET',
    url: `/v1/expense-reports/product-briefing/single/${id}`
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
    request: ProductBriefingSingleUpdateRequest;
    signatureFiles?: File[];
    newFiles?: File[];
  }
): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.signatureFiles !== undefined && data.signatureFiles !== null) {
    for (const v of data.signatureFiles) {
      form.append('signatureFiles', v);
    }
  }
  if (data.newFiles !== undefined && data.newFiles !== null) {
    for (const v of data.newFiles) {
      form.append('newFiles', v);
    }
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/expense-reports/product-briefing/single/${id}`,
    data: form
  });
}

/**
 * 지출보고 조회 - 제품설명회(복수기관)
 * GET /v1/expense-reports/product-briefing/multi/{id}
 */
export async function getProductBriefingMultiReport(id: number): Promise<ProductBriefingMultiDetailResponse> {
  const response = await axios.request<ProductBriefingMultiDetailResponse>({
    method: 'GET',
    url: `/v1/expense-reports/product-briefing/multi/${id}`
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
    request: ProductBriefingMultiUpdateRequest;
    newFiles?: File[];
  }
): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.newFiles !== undefined && data.newFiles !== null) {
    for (const v of data.newFiles) {
      form.append('newFiles', v);
    }
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/expense-reports/product-briefing/multi/${id}`,
    data: form
  });
}

/**
 * 이벤트 상세 조회
 * GET /v1/events/{id}
 */
export async function getEventBoardDetails(id: number): Promise<EventBoardDetailsResponse> {
  const response = await axios.request<EventBoardDetailsResponse>({
    method: 'GET',
    url: `/v1/events/${id}`
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
    request?: BoardPostUpdateRequest;
    eventRequest?: EventBoardUpdateRequest;
    thumbnail?: File;
    newFiles?: File[];
  }
): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.eventRequest !== undefined && data.eventRequest !== null) {
    form.append('eventRequest', new Blob([JSON.stringify(data.eventRequest)], { type: 'application/json' }));
  }
  if (data.thumbnail !== undefined && data.thumbnail !== null) {
    form.append('thumbnail', data.thumbnail);
  }
  if (data.newFiles !== undefined && data.newFiles !== null) {
    for (const v of data.newFiles) {
      form.append('newFiles', v);
    }
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/events/${id}`,
    data: form
  });
}

/**
 * 이벤트 게시글 삭제 (soft delete)
 * DELETE /v1/events/{id}
 */
export async function softDeleteEventBoard(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/events/${id}`
  });
}

/**
 * 배너 단건 조회
 * GET /v1/banners/{id}
 */
export async function getBanner(id: number): Promise<BannerResponse> {
  const response = await axios.request<BannerResponse>({
    method: 'GET',
    url: `/v1/banners/${id}`
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
    request: BannerUpdateRequest;
    imageFile?: File;
  }
): Promise<void> {
  const form = new FormData();
  if (data.request !== undefined && data.request !== null) {
    form.append('request', new Blob([JSON.stringify(data.request)], { type: 'application/json' }));
  }
  if (data.imageFile !== undefined && data.imageFile !== null) {
    form.append('imageFile', data.imageFile);
  }
  await axios.request({
    method: 'PATCH',
    url: `/v1/banners/${id}`,
    data: form
  });
}

/**
 * 앱 푸시 메시지 전송 테스트
 * GET /v1/test/push
 */
export async function testPush(options?: { userId?: string; message?: string }): Promise<void> {
  await axios.request({
    method: 'GET',
    url: '/v1/test/push',
    params: options
  });
}

/**
 * email 전송 테스트
 * GET /v1/test/email
 */
export async function testEmail(options?: { to?: string; subject?: string; body?: string }): Promise<void> {
  await axios.request({
    method: 'GET',
    url: '/v1/test/email',
    params: options
  });
}

/**
 * 버전별 약관
 * GET /v1/terms/{version}
 */
export async function getTermsByVersion(version: string): Promise<string> {
  const response = await axios.request<string>({
    method: 'GET',
    url: `/v1/terms/${version}`
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
    url: `/v1/terms/privacy/${version}`
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
    url: '/v1/terms/privacy/latest'
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
    url: '/v1/terms/latest'
  });
  return response.data;
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
  }
): Promise<PageSalesAgencyProductApplicantResponse> {
  const response = await axios.request<PageSalesAgencyProductApplicantResponse>({
    method: 'GET',
    url: `/v1/sales-agency-products/${id}/applicants`,
    params: options
  });
  return response.data;
}

/**
 * 영업대행 상품 신청자 목록 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/sales-agency-products/{id}/applicants/excel-download
 */
export async function downloadProductApplicantsExcel(
  id: number,
  options?: {
    userId?: string;
    name?: string;
    page?: number;
    size?: number;
  }
): Promise<Blob> {
  const response = await axios.request<Blob>({
    method: 'GET',
    url: `/v1/sales-agency-products/${id}/applicants/excel-download`,
    params: options,
    responseType: 'blob'
  });
  return response.data;
}

/**
 * 영업대행 상품 목록 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/sales-agency-products/excel-download
 */
export async function downloadSalesAgencyProductsExcel(options?: {
  productName?: string;
  clientName?: string;
  startAt?: DateString;
  endAt?: DateString;
  page?: number;
  size?: number;
}): Promise<Blob> {
  const response = await axios.request<Blob>({
    method: 'GET',
    url: '/v1/sales-agency-products/excel-download',
    params: options,
    responseType: 'blob'
  });
  return response.data;
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
    params: options
  });
  return response.data;
}

/**
 * 제품 정보 상세
 * GET /v1/products/{id}/details
 */
export async function getProductDetails(id: number): Promise<ProductDetailsResponse> {
  const response = await axios.request<ProductDetailsResponse>({
    method: 'GET',
    url: `/v1/products/${id}/details`
  });
  return response.data;
}

/**
 * 제품 정보 목록 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/products/excel-download
 */
export async function downloadProductSummariesExcel(options?: {
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
}): Promise<Blob> {
  const response = await axios.request<Blob>({
    method: 'GET',
    url: '/v1/products/excel-download',
    params: options,
    responseType: 'blob'
  });
  return response.data;
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
  dealerId?: number;
  startAt?: DateTimeString;
  endAt?: DateTimeString;
  page?: number;
  size?: number;
}): Promise<PagePrescriptionResponse> {
  const response = await axios.request<PagePrescriptionResponse>({
    method: 'GET',
    url: '/v1/prescriptions',
    params: options
  });
  return response.data;
}

/**
 * 처방 입력 목록 조회
 * GET /v1/prescriptions/partners
 */
export async function getPrescriptionPartnerList(options?: {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  companyName?: string;
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
    params: options
  });
  return response.data;
}

/**
 * 처방 입력 단건 조회
 * GET /v1/prescriptions/partners/{prescriptionPartnerId}
 */
export async function getPrescriptionPartner(prescriptionPartnerId: number): Promise<PrescriptionPartnerResponse> {
  const response = await axios.request<PrescriptionPartnerResponse>({
    method: 'GET',
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}`
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
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}`
  });
}

/**
 * 처방 입력 제품 목록 조회
 * GET /v1/prescriptions/partners/{prescriptionPartnerId}/products
 */
export async function getPartnerProducts(prescriptionPartnerId: number): Promise<PrescriptionPartnerProductResponse[]> {
  const response = await axios.request<PrescriptionPartnerProductResponse[]>({
    method: 'GET',
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}/products`
  });
  return response.data;
}

/**
 * 거래처별 제품상세 EDI 파일 보기
 * GET /v1/prescriptions/partners/{prescriptionPartnerId}/edi-files/attached
 */
export async function getAttachedEdiFiles(prescriptionPartnerId: number): Promise<AttachedFileResponse[]> {
  const response = await axios.request<AttachedFileResponse[]>({
    method: 'GET',
    url: `/v1/prescriptions/partners/${prescriptionPartnerId}/edi-files/attached`
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
    url: `/v1/prescriptions/partners/${prescriptionId}/edi-files/download`
  });
}

/**
 * 제약사명 목록 조회
 * GET /v1/partners/drug-companies
 */
export async function getDrugCompanies(): Promise<string[]> {
  const response = await axios.request<string[]>({
    method: 'GET',
    url: '/v1/partners/drug-companies'
  });
  return response.data;
}

/**
 * 파트너 계약 상세 조회
 * GET /v1/partner-contracts/{userId}
 */
export async function getContractDetails(userId: string): Promise<PartnerContractDetailsResponse> {
  const response = await axios.request<PartnerContractDetailsResponse>({
    method: 'GET',
    url: `/v1/partner-contracts/${userId}`
  });
  return response.data;
}

/**
 * 회원 상세 조회
 * GET /v1/members/{userId}/details
 */
export async function getMemberDetails(userId: string): Promise<MemberDetailsResponse> {
  const response = await axios.request<MemberDetailsResponse>({
    method: 'GET',
    url: `/v1/members/${userId}/details`
  });
  return response.data;
}

/**
 * 아이디 중복 체크
 * GET /v1/members/{userId}/available
 */
export async function isUserIdAvailable(userId: string): Promise<boolean> {
  const response = await axios.request<boolean>({
    method: 'GET',
    url: `/v1/members/${userId}/available`
  });
  return response.data;
}

/**
 * 회원 목록 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/members/excel-download
 */
export async function downloadUserMembersExcel(options?: {
  memberId?: number;
  userId?: string;
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
}): Promise<Blob> {
  const response = await axios.request<Blob>({
    method: 'GET',
    url: '/v1/members/excel-download',
    params: options,
    responseType: 'blob'
  });
  return response.data;
}

/**
 * 닉네임 중복 확인
 * GET /v1/members/available-nickname
 */
export async function isAvailableNickname(options?: { nickname?: string }): Promise<boolean> {
  const response = await axios.request<boolean>({
    method: 'GET',
    url: '/v1/members/available-nickname',
    params: options
  });
  return response.data;
}

/**
 * 관리자 권한 조회
 * GET /v1/members/admins/{userId}/permissions
 */
export async function getPermissions(userId: string): Promise<AdminPermissionResponse> {
  const response = await axios.request<AdminPermissionResponse>({
    method: 'GET',
    url: `/v1/members/admins/${userId}/permissions`
  });
  return response.data;
}

/**
 * 개원병원 목록 조회
 * GET /v1/hospitals
 */
export async function getHospitals(options?: {
  sido?: string;
  sigungu?: string;
  startDate?: DateTimeString;
  endDate?: DateTimeString;
  page?: number;
  size?: number;
}): Promise<PageHospitalResponse> {
  const response = await axios.request<PageHospitalResponse>({
    method: 'GET',
    url: '/v1/hospitals',
    params: options
  });
  return response.data;
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
    params: options
  });
  return response.data;
}

/**
 * 지출보고 목록 Excel 다운로드 (현재 페이지 기준)
 * GET /v1/expense-reports/excel-download
 */
export async function downloadExpenseReportListExcel(options?: {
  status?: 'PENDING' | 'COMPLETED';
  userId?: string;
  productName?: string;
  companyName?: string;
  reportType?: 'SAMPLE_PROVIDE' | 'PRODUCT_BRIEFING_MULTI' | 'PRODUCT_BRIEFING_SINGLE';
  eventDateFrom?: DateTimeString;
  eventDateTo?: DateTimeString;
  page?: number;
  size?: number;
}): Promise<Blob> {
  const response = await axios.request<Blob>({
    method: 'GET',
    url: '/v1/expense-reports/excel-download',
    params: options,
    responseType: 'blob'
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
    params: options
  });
  return response.data;
}

/**
 * 블라인드 게시글, 댓글 목록 조회
 * GET /v1/blind-posts
 */
export async function getBlindPosts(options?: {
  postType?: 'BOARD' | 'COMMENT';
  memberName?: string;
  startAt?: DateTimeString;
  endAt?: DateTimeString;
  page?: number;
  size?: number;
}): Promise<PageBlindPostResponse> {
  const response = await axios.request<PageBlindPostResponse>({
    method: 'GET',
    url: '/v1/blind-posts',
    params: options
  });
  return response.data;
}

/**
 * 암호화용 공개키
 * GET /v1/auth/public-key
 */
export async function getPublicKey(): Promise<{
  [key: string]: string;
}> {
  const response = await axios.request<{
    [key: string]: string;
  }>({
    method: 'GET',
    url: '/v1/auth/public-key'
  });
  return response.data;
}

/**
 * 나다
 * GET /v1/auth/me
 */
export async function whoAmI(): Promise<MemberDetailsResponse> {
  const response = await axios.request<MemberDetailsResponse>({
    method: 'GET',
    url: '/v1/auth/me'
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
    url: `/v1/hospitals/${id}`
  });
}

/**
 * 댓글 삭제
 * DELETE /v1/comments/{id}
 */
export async function deleteComment(id: number): Promise<void> {
  await axios.request({
    method: 'DELETE',
    url: `/v1/comments/${id}`
  });
}
