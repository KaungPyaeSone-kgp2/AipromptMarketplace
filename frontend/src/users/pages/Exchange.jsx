import React, { useState, useEffect } from 'react';

// Display info mapped by DB id
const PROVIDER_META = {
  1: { name: 'KBZ Pay', logo: '/kpaylogo.png' },
  2: { name: 'Aya Pay', logo: '/ayapaylogo.jfif' },
  3: { name: 'Wave Pay', logo: '/wavepay.jfif' },
};

function resolveQrUrl(path) {
  if (!path) return '';  
  if (path.startsWith('http')) return path;
  if (path.startsWith('backend/')) return path.replace('backend/', '/api/');
  if (path.includes('uploads/')) return path.startsWith('/') ? `/api${path}` : `/api/${path}`;
  return `/api/uploads/payment_method_info/${path}`;
}

export default function ExchangePage() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [amount, setAmount] = useState("");
  const estimatedPoints = amount > 0 ? (amount / 1000).toFixed(2) : '0.00';
  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/users/exchange/getPaymentMethods.php')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data.length > 0) {
          setPaymentMethods(json.data);
          setSelectedId(json.data[0].id);
        }
      })
      .catch(err => console.error("Failed to fetch payment methods", err));
  }, []);

  const selected = paymentMethods.find(m => m.id === selectedId);
  const meta = selected ? (PROVIDER_META[selected.id] || { name: `Method ${selected.id}`, logo: '' }) : null;

  return (
    <div className="fade-in space-y-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <header>
        <h1 className="text-xl font-black uppercase tracking-widest text-violet-300">Exchange</h1>
      </header>

      {/* Two Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Exchange Rate Banner */}
          <div className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-6 shadow-xl shadow-black/15 flex items-center justify-between">
            <div className="flex items-center gap-3 text-violet-300">
              {/* <span className="material-symbols-outlined">currency_exchange</span> */}
              <span className="font-bold text-xl">Current Rate</span>
            </div>
            <div className="text-xl font-black text-white">1,000 MMK = 1 Coin</div>
          </div>

          {/* Provider Selection */}
          <section className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-6 shadow-xl shadow-black/15 space-y-4">
            <h2 className="text-sm font-black text-white">Select Payment Provider</h2>
            <div className="grid grid-cols-3 gap-4">
              {paymentMethods.map((method) => {
                const isSelected = selectedId === method.id;
                const providerMeta = PROVIDER_META[method.id] || { name: `Method ${method.id}`, logo: '' };
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedId(method.id)}
                    className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isSelected
                      ? 'border-2 border-violet-500 bg-violet-500/10 hover:bg-violet-500/15'
                      : 'border border-slate-700/60 bg-slate-900/50 hover:bg-slate-800'
                      }`}
                  >
                    {providerMeta.logo && <img
                      src={providerMeta.logo}
                      alt={`${providerMeta.name} Logo`}
                      className={`w-8 h-8 object-contain ${isSelected ? '' : 'opacity-70'}`}
                    />}
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {providerMeta.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Amount Input */}
          <section className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-6 shadow-xl shadow-black/15 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-300" htmlFor="mmk-amount">Amount to Exchange (MMK)</label>
              <div className="relative">
                <input className="w-full border border-slate-700 bg-slate-950 rounded-xl py-3 px-4 text-white outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 font-black text-lg" id="mmk-amount" placeholder="0" type="text" inputMode="numeric" value={amount ? Number(amount).toLocaleString() : ""} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-bold">MMK</span>
              </div>
            </div>
            <div className="flex justify-center py-2">
              <span className="material-symbols-outlined text-slate-500">arrow_downward</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-300">Estimated Points</label>
              <div className="w-full border border-slate-700 bg-[#070814] rounded-xl py-3 px-4 flex items-center justify-between">
                <span className="text-cyan-300 font-black text-lg">{estimatedPoints}</span>
                <span className="text-cyan-300 text-sm font-bold">PTS</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Payment & Summary */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Payment Instructions & QR */}
          <section className="rounded-2xl border border-slate-700/60 bg-slate-950/70 p-6 shadow-xl shadow-black/15 flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-sm font-black text-white">Transfer Details</h2>
              <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-black bg-violet-500/10 text-violet-300 rounded-full">Awaiting Payment</span>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center pt-2">
              {selected ? (
                <>
                  <div className="text-center">
                    <div className="text-sm text-slate-400 mb-1">Receiver Account Name</div>
                    <div className="text-lg font-black text-white">{selected.account_name}</div>
                    {selected.account_phone_number && <div className="text-sm font-bold text-violet-300 mt-1">{selected.account_phone_number}</div>}
                  </div>
                  <div className="p-2 bg-white rounded-lg inline-block shadow-sm">
                    <img alt={`QR Code for ${meta.name}`} className="w-40 h-40 object-contain rounded" src={resolveQrUrl(selected.account_qr_image)} />
                  </div>
                  <p className="text-xs text-slate-500 text-center max-w-[250px]">
                    Scan the QR code to send payment directly via {meta.name} app.
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">Loading payment methods...</p>
              )}
            </div>

            {/* Receipt Upload */}
            <div className="mt-auto pt-4 flex flex-col gap-3">
              <label className="text-sm font-black text-slate-300">Upload Transaction Receipt</label>
              {receipt ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                  {receipt.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(receipt)} alt="Receipt preview" className="w-16 h-16 object-cover rounded-lg border border-slate-600" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-600">
                      <span className="material-symbols-outlined text-slate-400">description</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{receipt.name}</p>
                    <p className="text-xs text-slate-500">{(receipt.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceipt(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-700 transition text-slate-400 hover:text-rose-400"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-800 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="material-symbols-outlined text-slate-500 mb-2 text-2xl">cloud_upload</span>
                    <p className="mb-1 text-sm text-slate-400"><span className="font-bold text-violet-300">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">PNG, JPG or PDF (MAX. 5MB)</p>
                  </div>
                  <input
                    className="hidden"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setReceipt(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex justify-end pt-4 border-t border-slate-800 mt-4">
        <button className="rounded-xl bg-violet-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 flex items-center gap-2">
          <span>Confirm Exchange</span>
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 700" }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}