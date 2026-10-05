// These shapes mirror response bodies from the backend_agentic_mall API.
// Inlined here (not re-exported from backend source) because this is now a
// separate repo — kept in sync by hand when the backend's response shapes change.

export type ScopeCategory = "products" | "inventory" | "shipping" | "returns" | "warranty" | "orders" | "checkout";

export interface Money {
  amount: number;
  currency: string;
}

export interface ShippingInfo {
  isFree: boolean;
  cost: number | null;
  estimatedDays: number | null;
  available: boolean;
}

export interface ReturnsInfo {
  windowDays: number | null;
  isFreeReturns: boolean;
  notes?: string;
}

export interface WarrantyInfo {
  months: number | null;
  notes?: string;
}

export interface InventoryInfo {
  inStock: boolean;
  quantity: number | null;
}

export interface ContentFlag {
  field: string;
  pattern: string;
  excerpt: string;
}

export type ConnectorKind = "rest" | "mcp" | "web";

export interface Offer {
  merchantId: string;
  merchantName: string;
  productId: string;
  title: string;
  description: string;
  category: "product" | "service";
  price: Money;
  image: string;
  attributes: Record<string, string>;
  availability: InventoryInfo;
  shipping: ShippingInfo;
  returnPolicy: ReturnsInfo;
  warranty: WarrantyInfo;
  source: ConnectorKind;
  retrievedAt: string;
  isStale: boolean;
  contentFlags: ContentFlag[];
}

export type AuctionStatus = "draft" | "open" | "ended" | "settled" | "cancelled";
export type BidStatus = "placed" | "winning" | "outbid" | "rejected";
export type SettlementType = "auction_win" | "buy_now";
export type SettlementPaymentStatus = "authorized" | "declined" | "succeeded" | "failed";
export type SettlementStatus = "pending" | "completed" | "cancelled" | "refunded";

export interface PublicAuction {
  id: string;
  merchant: { id: string; name: string };
  merchantUrl: string;
  productId: string;
  title: string;
  description: string;
  startingBid: number;
  currentBid: number | null;
  buyNowPrice: number | null;
  currency: string;
  status: AuctionStatus;
  startsAt: string;
  firstBidAt: string | null;
  endsAt: string | null;
  winnerUserId: string | null;
}

export interface AuctionEstimate {
  currency: string;
  itemAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface AuctionBidRow {
  id: string;
  auction_id: string;
  user_id: string;
  amount: string;
  currency: string;
  status: BidStatus;
  created_at: string;
}

export interface AuctionSettlementRow {
  id: string;
  auction_id: string;
  user_id: string;
  amount: string;
  shipping_amount: string;
  tax_amount: string;
  total_amount: string;
  currency: string;
  status: SettlementStatus;
  settlement_type: SettlementType;
  payment_status: SettlementPaymentStatus;
  winning_bid_id: string | null;
}

export type ApprovalActionType = "merchant_visit" | "purchase" | "auction_bid" | "buy_now";
export type ApprovalStatus = "requested" | "pending" | "approved" | "rejected";

export interface ApprovalRow {
  id: string;
  user_id: string;
  session_id: string | null;
  merchant_id: string | null;
  action_type: ApprovalActionType;
  payload: Record<string, unknown>;
  status: ApprovalStatus;
  requested_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

export type MerchantStatus = "pending_verification" | "domain_verified" | "authorized" | "revoked";
export type ConnectorType = "rest" | "mcp" | "web";

export interface RestConnectorConfig {
  baseUrl: string;
}
export interface McpConnectorConfigDb {
  command: string;
  args: string[];
}
export interface WebConnectorConfigDb {
  baseUrl: string;
  pagePaths: string[];
}

export interface MerchantRow {
  id: string;
  name: string;
  slug: string;
  domain: string;
  category: string;
  status: MerchantStatus;
  connector_type: ConnectorType;
  connector_config: RestConnectorConfig | McpConnectorConfigDb | WebConnectorConfigDb;
  is_adversarial_demo: boolean;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthorizationRow {
  id: string;
  merchant_id: string;
  scopes: ScopeCategory[];
  status: "active" | "revoked";
  authorized_at: string;
  revoked_at: string | null;
}

export interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodRow {
  id: string;
  user_id: string;
  provider: string;
  brand: string | null;
  last4: string | null;
  exp_month: number | null;
  exp_year: number | null;
  is_default: boolean;
  created_at: string;
}

export interface Requirements {
  maxPrice?: number;
  color?: string;
  freeShippingOnly?: boolean;
  minReturnDays?: number;
  requireProduct?: boolean;
}

export interface NormalizedOffer {
  offer: Offer;
  verdict: "selected" | "rejected";
  reasons: string[];
}

export interface MerchantSearchOutcome {
  merchantId: string;
  merchantName: string;
  offers: NormalizedOffer[];
  blocked?: string;
  error?: string;
}

export interface SearchResponse {
  sessionId: string;
  requirements: Requirements;
  merchants: MerchantSearchOutcome[];
  offers: NormalizedOffer[];
}

export interface CompareEntry {
  merchantId: string;
  productId: string;
  offer?: Offer;
  error?: string;
}

export interface CompareResponse {
  sessionId: string;
  comparison: CompareEntry[];
}
