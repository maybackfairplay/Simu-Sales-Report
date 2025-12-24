
export interface SaleRecord {
  client: string;
  mobileNo: string;
  branchOffice: string;
  dealership: string;
  disbursedOnDate: string;
  registrationNo: string;
  chasisNo: string;
  make: string;
  model: string;
  type: string;
}

export interface AggregatedData {
  name: string;
  sales: number;
  [key: string]: any;
}

export interface DashboardStats {
  byDealer: AggregatedData[];
  byShop: AggregatedData[];
  byModel: AggregatedData[];
  byBranch: AggregatedData[];
  totalSales: number;
  topDealer: string;
  topShop: string;
  topModel: string;
  topBranch: string;
  rawRecords: SaleRecord[];
}
