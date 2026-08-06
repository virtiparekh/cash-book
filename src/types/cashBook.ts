
export type CashBookGroup = {
  id: string;
  name: string;
  description: string | null;
  currencyCode: string;
  openingBalance: number;
  role: "admin" | "member";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCashBookGroupInput = {
  name: string;
  description: string;
  currencyCode: string;
  openingBalance: number;
  ownerName: string;
};