import { delay } from 'utils/medipanda/delay';
import { mockBusinessLineMembers } from 'api-mock-data/MpBusinessLineMemberMock';

export interface MpBusinessLineMember {
  id: number;
  memberName: string;
  memberNo: string;
  userId: string;
}

export interface MpBusinessLineMemberSearchRequest {
  searchType?: string;
  searchKeyword?: string;
}

export const mpFetchBusinessLineMembers = async (request: MpBusinessLineMemberSearchRequest = {}): Promise<MpBusinessLineMember[]> => {
  await delay(300);

  let filteredMembers = Object.values(mockBusinessLineMembers);

  if (request.searchType && request.searchKeyword) {
    filteredMembers = filteredMembers.filter((member) => {
      switch (request.searchType) {
        case '회원명':
          return member.memberName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '회원번호':
          return member.memberNo.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '아이디':
          return member.userId.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        default:
          return true;
      }
    });
  }

  return filteredMembers;
};
