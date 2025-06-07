import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockPrescriptionForms } from 'api-mock-data/MpPrescriptionFormMock';

export interface MpPrescriptionForm {
  id: number;
  dealerNumber: string;
  userId: string;
  userName: string;
  managerCode: string;
  businessName: string;
  businessNumber: string;
  prescriptionDate: string;
  settlementDate: string;
  registrationDate: string;
  prescriptionAmount: number;
  inputStatus: string;
  sequence: number;
}

export interface MpPrescriptionFormSearchRequest extends MpPagedRequest<MpPrescriptionForm> {
  userName?: string;
  approvalStatus?: string;
  startDate?: string;
  endDate?: string;
  searchKeyword?: string;
}

export const mpFetchPrescriptionForms = async (request: MpPrescriptionFormSearchRequest): Promise<MpPagedResponse<MpPrescriptionForm>> => {
  await delay(300);

  let filteredForms = Object.values(mockPrescriptionForms) as MpPrescriptionForm[];

  if (request.userName) {
    filteredForms = filteredForms.filter((form) => form.userName.includes(request.userName!));
  }

  if (request.approvalStatus) {
    filteredForms = filteredForms.filter((form) => form.inputStatus === request.approvalStatus);
  }

  if (request.searchKeyword) {
    filteredForms = filteredForms.filter((form) =>
      Object.values(form).some((value) => value.toString().toLowerCase().includes(request.searchKeyword!.toLowerCase()))
    );
  }

  const contentWithSequence: MpWithSequence<MpPrescriptionForm>[] = filteredForms
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((form, index) => ({
      ...form,
      sequence: filteredForms.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: {
      pageNumber: request.page
    },
    totalPages: Math.ceil(filteredForms.length / request.size),
    totalElements: filteredForms.length
  };
};

export const mpFetchPrescriptionFormDetail = async (formId: number): Promise<MpPrescriptionForm> => {
  await delay(300);

  const form = mockPrescriptionForms[formId];
  if (!form) {
    throw new Error(`처방전 양식 ID ${formId}를 찾을 수 없습니다.`);
  }

  return form;
};
