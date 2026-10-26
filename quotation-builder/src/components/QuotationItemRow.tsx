import React, { memo } from 'react';
import { Trash2, Copy, Sparkles, AlertCircle } from 'lucide-react';
import { QuotationItem } from '../types';
import { formatINR } from '../utils/calculations';

interface QuotationItemRowProps {
  index: number;
  item: QuotationItem;
  onUpdate: (id: string, updates: Partial<QuotationItem>) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}

/**
 * QuotationItemRow is wrapped in React.memo with a stable callback interface.
 * Each input uses standard controlled input without resetting focus,
 * preventing any focus loss on keystrokes.
 */
export const QuotationItemRow: React.FC<QuotationItemRowProps> = memo(({
  index,
  item,
  onUpdate,
  onDuplicate,
  onRemove,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-amber-300 transition-all space-y-3">
      {/* Row Header & Actions */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-700">Line Item #{index + 1}</span>
          {item.productId && (
            <span className="text-[10px] bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded border border-amber-200 flex items-center">
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              Catalogue Linked
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onDuplicate(item.id)}
            title="Duplicate Row"
            className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded text-xs flex items-center"
          >
            <Copy className="w-3.5 h-3.5 mr-1" />
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            title="Remove Row"
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs flex items-center"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Remove
          </button>
        </div>
      </div>

      {/* Primary Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
        {/* Product / Service Name */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Product / Service Name *
          </label>
          <input
            type="text"
            required
            value={item.name}
            onChange={(e) => onUpdate(item.id, { name: e.target.value })}
            placeholder="e.g. Fluke 87V Industrial Multimeter"
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Brand</label>
          <input
            type="text"
            value={item.brand}
            onChange={(e) => onUpdate(item.id, { brand: e.target.value })}
            placeholder="Fluke, FLIR"
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Model / Part No */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Model / Part No.</label>
          <input
            type="text"
            value={item.model}
            onChange={(e) => onUpdate(item.id, { model: e.target.value })}
            placeholder="87V"
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
          />
        </div>

        {/* HSN/SAC */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">HSN / SAC</label>
          <input
            type="text"
            value={item.hsnSac}
            onChange={(e) => onUpdate(item.id, { hsnSac: e.target.value })}
            placeholder="9030"
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Commercial Description
          </label>
          <textarea
            rows={2}
            value={item.description}
            onChange={(e) => onUpdate(item.id, { description: e.target.value })}
            placeholder="Scope of supply, included probes, case..."
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Technical Specifications / Parameters
          </label>
          <textarea
            rows={2}
            value={item.technicalSpecs}
            onChange={(e) => onUpdate(item.id, { technicalSpecs: e.target.value })}
            placeholder="Voltage: 1000V | Accuracy: 0.05% | Rating: CAT IV 600V..."
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Quantity, Rate, Discount, GST & Computed Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs items-end">
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Qty *</label>
          <input
            type="number"
            min="0.01"
            step="any"
            required
            value={item.quantity === 0 ? '' : item.quantity}
            onChange={(e) =>
              onUpdate(item.id, { quantity: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-slate-300 bg-white focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Unit</label>
          <input
            type="text"
            value={item.unit}
            onChange={(e) => onUpdate(item.id, { unit: e.target.value })}
            placeholder="Nos / Set"
            className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Rate (₹) *</label>
          <input
            type="number"
            min="0"
            step="any"
            required
            value={item.rate === 0 ? '' : item.rate}
            onChange={(e) =>
              onUpdate(item.id, { rate: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-slate-300 bg-white focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Discount %</label>
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            value={item.discountPercent === 0 ? '' : item.discountPercent}
            onChange={(e) =>
              onUpdate(item.id, { discountPercent: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 bg-white focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">GST Rate %</label>
          <select
            value={item.gstRate}
            onChange={(e) =>
              onUpdate(item.id, { gstRate: Number(e.target.value) || 0 })
            }
            className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 bg-white focus:ring-1 focus:ring-amber-500"
          >
            <option value={18}>18%</option>
            <option value={28}>28%</option>
            <option value={12}>12%</option>
            <option value={5}>5%</option>
            <option value={0}>0%</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Taxable (₹)</label>
          <div className="px-2 py-1 text-xs font-mono font-semibold text-slate-900 bg-slate-200/60 rounded text-right truncate">
            {formatINR(item.taxableAmount, false)}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-amber-800 mb-0.5">Total (₹)</label>
          <div className="px-2 py-1 text-xs font-mono font-bold text-amber-900 bg-amber-100/60 rounded text-right truncate">
            {formatINR(item.totalAmount, false)}
          </div>
        </div>
      </div>
    </div>
  );
});
