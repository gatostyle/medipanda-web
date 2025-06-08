import { MpPagedRequest, MpPagedResponse } from './MpPaged';
import { mockPagedResponse } from './mockups';
import { mockBanners } from 'api-mock-data/MpBannerMock';
import { delay } from 'utils/medipanda/delay';

export interface MpBanner {
  id: number;
  position: string;
  title: string;
  state: boolean;
  scope: {
    contracted: boolean;
    nonContracted: boolean;
  };
  startAt: string;
  endAt: string;
  createdAt: string;
  order: number;
  impressions: number;
  views: number;
  ctr: number;
  imageUrl?: string;
  linkUrl?: string;
}

export interface MpBannerSearchRequest extends MpPagedRequest<MpBanner> {
  position?: string;
  title?: string;
  state?: boolean;
  startAt?: string;
  endAt?: string;
}

export async function mpFetchBanner(id: number): Promise<MpBanner> {
  await delay(500);
  const banner = mockBanners[id];
  if (banner) {
    return banner;
  }
  throw new Error('Banner not found');
}

export async function mpFetchBanners(request: MpBannerSearchRequest): Promise<MpPagedResponse<MpBanner>> {
  await delay(500);
  return mockPagedResponse(request, Object.values(mockBanners));
}

export async function mpUpdateBanner(id: number, payload: Partial<MpBanner>): Promise<void> {
  await delay(500);
  if (mockBanners[id]) {
    mockBanners[id] = {
      ...mockBanners[id],
      ...payload
    };
    return;
  }
  throw new Error('Banner not found');
}

export async function mpCreateBanner(payload: Omit<MpBanner, 'id'>): Promise<MpBanner> {
  await delay(500);
  const newId = Math.max(...Object.keys(mockBanners).map(Number)) + 1;
  const newBanner = { id: newId, ...payload };
  mockBanners[newId] = newBanner;
  return newBanner;
}
