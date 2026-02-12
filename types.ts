
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
  status?: string;
}

export interface ReportMetadata {
  id: string;
  filename: string;
  timestamp: number;
  totalSales: number;
  topDealer: string;
  healthScore: number;
}

export interface AggregatedData {
  name: string;
  sales: number;
  share?: number;
  [key: string]: any;
}

export interface StatusMetrics {
  pendingETR: number;
  pendingSoftware: number;
  paymentStage: number;
  reprocessStage: number;
}

export interface Anomaly {
  id: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
}

export interface DashboardStats {
  id?: string;
  timestamp?: number;
  byDealer: AggregatedData[];
  byShop: AggregatedData[];
  byModel: AggregatedData[];
  byBranch: AggregatedData[];
  dealerShopMap: Record<string, AggregatedData[]>; 
  totalSales: number;
  topDealer: string;
  topShop: string;
  topModel: string;
  topBranch: string;
  rawRecords: SaleRecord[];
  metrics: StatusMetrics;
  anomalies?: Anomaly[];
  healthScore: number;
}
