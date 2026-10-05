"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import {
  IconAlert, IconCard, IconCheck, IconChart, IconClock, IconReceipt, IconRefresh, IconTag,
} from "@/lib/icons";

interface OrderItem { name: string; sku: string; quantity: number; unitPrice: number }
interface Customer { id: string; name: string; email: string; city: string; region: string; postal_code: string; country: string }
interface Order {
  id: string; order_number: string; items: OrderItem[]; subtotal: string; shipping: string;
  tax_jurisdiction: string; tax_rate: string; tax_amount: string; total: string; status: string; currency: string;
}
interface PaymentEvent { step: string; detail: Record<string, unknown>; occurred_at: string }
interface Payment {
  id: string; payment_ref: string; status: string; payment_method_brand: string; payment_method_last4: string;
  authorization_ref: string; transaction_ref: string; processor_response: string; risk_status: string;
  settlement_status: string; refunded_amount: string; amount: string;
}
interface Invoice {
  invoiceNumber: string; orderNumber: string; customer: Customer; items: OrderItem[];
  subtotal: number; shipping: number; taxJurisdiction: string; taxRate: number; taxAmount: number; total: number; paymentStatus: string;
}
interface Analytics {
  transactionsToday: number; successfulPayments: number; failedPayments: number; processingPayments: number;
  processedVolume: number; pendingSettlement: number; taxCollected: number; revenue: number;
}
interface RecentOrder { order_number: string; customer_name: string; total: string; payment_status: string | null; payment_method_brand: string | null; payment_method_last4: string | null; status: string }

const STEP_LABELS: Record<string, string> = {
  creating_payment: "Creating payment",
  validating_customer: "Validating customer",
  calculating_tax: "Calculating tax",
  authorizing_payment: "Authorizing payment",
  capturing_payment: "Capturing payment",
  creating_transaction: "Creating transaction",
  updating_accounting: "Updating accounting",
  payment_successful: "Payment successful",
};
const SCENARIOS = [
  { key: "nyc", label: "New York, NY" },
  { key: "la", label: "Los Angeles, CA" },
  { key: "austin", label: "Austin, TX" },
];

function money(n: number | string, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(n));
}

export default function BillingDemoPage() {
  const [scenario, setScenario] = useState("nyc");
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<PaymentEvent[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("50");
  const [refundDone, setRefundDone] = useState(false);
  const seededOnce = useRef(false);

  async function loadAnalytics() {
    const res = await apiGet<{ analytics: Analytics; recentOrders: RecentOrder[] }>("/api/demo/checkout/analytics");
    setAnalytics(res.analytics);
    setRecentOrders(res.recentOrders);
  }

  useEffect(() => { loadAnalytics().catch(() => {}); }, []);

  async function seedOrder(key: string) {
    setBusy("seed"); setError(null); setPayment(null); setInvoice(null); setVisibleEvents([]); setRefundDone(false);
    try {
      const res = await apiPost<{ order: Order; customer: Customer }>("/api/demo/checkout/seed", { scenario: key });
      setOrder(res.order);
      setCustomer(res.customer);
      setScenario(key);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the demo order.");
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    if (seededOnce.current) return;
    seededOnce.current = true;
    seedOrder("nyc");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function processPayment(simulateDecline = false) {
    if (!order) return;
    setBusy("pay"); setError(null); setVisibleEvents([]);
    try {
      const res = await apiPost<{ payment: Payment; events: PaymentEvent[]; order: Order }>(`/api/demo/checkout/orders/${order.id}/pay`, {
        paymentMethodToken: simulateDecline ? "demo-decline" : undefined,
      });
      setOrder(res.order);
      // Animate through the real recorded steps rather than dumping them all at once.
      for (let i = 0; i < res.events.length; i++) {
        await new Promise((r) => setTimeout(r, 260));
        setVisibleEvents((v) => [...v, res.events[i]!]);
      }
      if (res.payment.status === "failed") {
        setError("Payment declined by the payment provider (simulated).");
      } else {
        setPayment(res.payment);
      }
      loadAnalytics().catch(() => {});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment failed.");
    } finally {
      setBusy(null);
    }
  }

  async function loadInvoice() {
    if (!order) return;
    setBusy("invoice"); setError(null);
    try {
      const res = await apiGet<Invoice>(`/api/demo/checkout/orders/${order.id}/invoice`);
      setInvoice(res);
    } catch {
      setError("Couldn't load the invoice.");
    } finally {
      setBusy(null);
    }
  }

  async function submitRefund() {
    if (!payment) return;
    setBusy("refund"); setError(null);
    try {
      await apiPost(`/api/demo/checkout/payments/${payment.id}/refund`, { amount: Number(refundAmount), reason: "Customer requested partial refund" });
      setRefundDone(true);
      loadAnalytics().catch(() => {});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Refund failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="am-section-head">
        <h1>Payments &amp; Accounting</h1>
        <p>Prototype financial engine — mock payment/tax/accounting services with real calculations and a real balanced ledger, no live processor connected.</p>
      </div>

      {analytics && (
        <div className="am-stat-grid" style={{ marginBottom: 20 }}>
          <div className="am-stat-card"><div className="am-stat-label">Transactions today</div><div className="am-stat-value">{analytics.transactionsToday}</div></div>
          <div className="am-stat-card"><div className="am-stat-label">Successful</div><div className="am-stat-value" style={{ color: "var(--am-success-text)" }}>{analytics.successfulPayments}</div></div>
          <div className="am-stat-card"><div className="am-stat-label">Failed</div><div className="am-stat-value" style={{ color: "var(--am-danger-text)" }}>{analytics.failedPayments}</div></div>
          <div className="am-stat-card"><div className="am-stat-label">Processed volume</div><div className="am-stat-value">{money(analytics.processedVolume)}</div></div>
          <div className="am-stat-card"><div className="am-stat-label">Tax collected</div><div className="am-stat-value">{money(analytics.taxCollected)}</div></div>
          <div className="am-stat-card"><div className="am-stat-label">Revenue</div><div className="am-stat-value">{money(analytics.revenue)}</div></div>
          <div className="am-stat-card"><div className="am-stat-label">Pending settlement</div><div className="am-stat-value">{money(analytics.pendingSettlement)}</div></div>
        </div>
      )}

      <div className="am-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        <section className="am-card">
          <h2 className="am-modal-title">Demo checkout</h2>
          <p className="am-auth-subtitle">Pick a destination to see the tax engine compute a different rate.</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {SCENARIOS.map((s) => (
              <button key={s.key} className={`am-btn am-btn-sm ${scenario === s.key ? "am-btn-primary" : "am-btn-secondary"}`} onClick={() => seedOrder(s.key)} disabled={!!busy}>
                {s.label}
              </button>
            ))}
          </div>

          {order && customer && (
            <>
              <div className="am-list-row">
                <span className="am-list-row-icon"><IconTag width={15} height={15} /></span>
                <span className="am-list-row-body"><span className="am-list-row-title">{order.order_number}</span><span className="am-list-row-sub">{customer.name} · {customer.city}, {customer.region}</span></span>
              </div>
              {order.items.map((it) => (
                <div className="am-breakdown-row" key={it.sku}><span>{it.name} × {it.quantity}</span><span>{money(it.unitPrice * it.quantity)}</span></div>
              ))}
              <div className="am-breakdown-row"><span>Shipping</span><span>{money(order.shipping)}</span></div>
              <div className="am-breakdown-row"><span>{order.tax_jurisdiction} tax ({(Number(order.tax_rate) * 100).toFixed(3)}%)</span><span>{money(order.tax_amount)}</span></div>
              <div className="am-breakdown-row" style={{ fontWeight: 700, borderTop: "1px solid var(--am-border)", paddingTop: 10, marginTop: 4 }}><span>Total</span><span>{money(order.total)}</span></div>

              {error && <p className="am-error-text" role="alert" style={{ marginTop: 10 }}>{error}</p>}

              {!payment && (
                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <button className="am-btn am-btn-primary" style={{ flex: 1 }} onClick={() => processPayment(false)} disabled={!!busy || order.status === "paid"}>
                    {busy === "pay" ? <span className="am-spinner" /> : order.status === "paid" ? "Already paid" : "Process payment"}
                  </button>
                  <button className="am-btn am-btn-secondary am-btn-sm" onClick={() => processPayment(true)} disabled={!!busy || order.status === "paid"} title="Routes through the same decline path a real card decline would take">
                    Simulate decline
                  </button>
                </div>
              )}
            </>
          )}

          {visibleEvents.length > 0 && (
            <div className="am-trace" style={{ marginTop: 16 }}>
              {visibleEvents.map((e, i) => (
                <div className="am-trace-step active" key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0" }}>
                  <span className="am-trace-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--am-success-text)", flexShrink: 0 }} />
                  {STEP_LABELS[e.step] ?? e.step}
                </div>
              ))}
            </div>
          )}

          {payment && (
            <div className="am-card-flat" style={{ marginTop: 16 }}>
              <div className="am-row-between" style={{ marginBottom: 10 }}>
                <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><IconCheck width={16} height={16} style={{ color: "var(--am-success-text)" }} />Payment succeeded</span>
                <span className="am-badge am-badge-success">{payment.status}</span>
              </div>
              <div className="am-breakdown-row"><span>Payment ID</span><code style={{ fontSize: 12 }}>{payment.payment_ref}</code></div>
              <div className="am-breakdown-row"><span>Transaction ID</span><code style={{ fontSize: 12 }}>{payment.transaction_ref}</code></div>
              <div className="am-breakdown-row"><span>Authorization ID</span><code style={{ fontSize: 12 }}>{payment.authorization_ref}</code></div>
              <div className="am-breakdown-row"><span>Method</span><span style={{ display: "flex", alignItems: "center", gap: 5 }}><IconCard width={13} height={13} />{payment.payment_method_brand} •••• {payment.payment_method_last4}</span></div>
              <div className="am-breakdown-row"><span>Processor response</span><span>{payment.processor_response}</span></div>
              <div className="am-breakdown-row"><span>Risk</span><span style={{ textTransform: "capitalize" }}>{payment.risk_status}</span></div>
              <div className="am-breakdown-row"><span>Settlement</span><span style={{ display: "flex", alignItems: "center", gap: 5 }}><IconClock width={13} height={13} />{payment.settlement_status}</span></div>

              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button className="am-btn am-btn-secondary am-btn-sm" onClick={loadInvoice} disabled={!!busy}>
                  <IconReceipt width={14} height={14} />View invoice
                </button>
              </div>

              {!refundDone ? (
                <div style={{ marginTop: 14, borderTop: "1px solid var(--am-border)", paddingTop: 14 }}>
                  <label className="am-label">Refund amount</label>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <input className="am-input" type="number" min={1} max={Number(payment.amount)} value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} style={{ maxWidth: 120 }} />
                    <button className="am-btn am-btn-danger am-btn-sm" onClick={submitRefund} disabled={!!busy}>
                      {busy === "refund" ? <span className="am-spinner" /> : <><IconRefresh width={14} height={14} />Refund {money(refundAmount || 0)}</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="am-list-row" style={{ marginTop: 14 }}>
                  <span className="am-list-row-icon"><IconRefresh width={15} height={15} /></span>
                  <span className="am-list-row-body"><span className="am-list-row-title">Refund issued</span><span className="am-list-row-sub">{money(refundAmount)} refunded — order and ledger updated</span></span>
                </div>
              )}
            </div>
          )}
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {invoice && (
            <section className="am-card">
              <div className="am-row-between" style={{ marginBottom: 4 }}>
                <h2 className="am-modal-title" style={{ marginBottom: 0 }}>Invoice {invoice.invoiceNumber}</h2>
                <span className="am-badge am-badge-success">{invoice.paymentStatus}</span>
              </div>
              <p className="am-auth-subtitle">{invoice.customer.name} · {invoice.customer.email}<br />{invoice.customer.city}, {invoice.customer.region} {invoice.customer.postal_code}</p>
              {invoice.items.map((it) => (
                <div className="am-breakdown-row" key={it.sku}><span>{it.name} × {it.quantity}</span><span>{money(it.unitPrice * it.quantity)}</span></div>
              ))}
              <div className="am-breakdown-row"><span>Subtotal</span><span>{money(invoice.subtotal)}</span></div>
              <div className="am-breakdown-row"><span>Shipping</span><span>{money(invoice.shipping)}</span></div>
              <div className="am-breakdown-row"><span>{invoice.taxJurisdiction} tax ({(invoice.taxRate * 100).toFixed(3)}%)</span><span>{money(invoice.taxAmount)}</span></div>
              <div className="am-breakdown-row" style={{ fontWeight: 700, borderTop: "1px solid var(--am-border)", paddingTop: 10 }}><span>Total</span><span>{money(invoice.total)}</span></div>
            </section>
          )}

          <section className="am-card">
            <h2 className="am-modal-title" style={{ display: "flex", alignItems: "center", gap: 7 }}><IconChart width={16} height={16} />Recent transactions</h2>
            {recentOrders.length === 0 && <p className="am-help-text">No transactions yet.</p>}
            {recentOrders.map((o) => (
              <div className="am-list-row" key={o.order_number}>
                <span className="am-list-row-icon">
                  {o.payment_status === "succeeded" ? <IconCheck width={15} height={15} style={{ color: "var(--am-success-text)" }} /> : o.payment_status === "failed" ? <IconAlert width={15} height={15} style={{ color: "var(--am-danger-text)" }} /> : <IconClock width={15} height={15} />}
                </span>
                <span className="am-list-row-body">
                  <span className="am-list-row-title">{o.customer_name}</span>
                  <span className="am-list-row-sub">{o.order_number}{o.payment_method_brand ? ` · ${o.payment_method_brand} ••••${o.payment_method_last4}` : ""}</span>
                </span>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{money(o.total)}</span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
