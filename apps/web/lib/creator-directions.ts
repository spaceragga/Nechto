export const CREATOR_DIRECTION_IDS = [
  'illustration',
  'graphic-design',
  'photography',
  'fashion',
  'craft',
  'video',
  'interior',
  'beauty',
] as const;

export type CreatorDirectionId = (typeof CREATOR_DIRECTION_IDS)[number];

export const DEMO_PROFILE_HREF = '/u/demo';
