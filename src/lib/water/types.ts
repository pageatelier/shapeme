export type WaterLog = {
  id: string;
  amountMl: number;
  time: string; // HH:mm, local display only
  loggedAt: string; // ISO timestamp
};

export type WaterDay = {
  entries: WaterLog[];
  totalMl: number;
};
