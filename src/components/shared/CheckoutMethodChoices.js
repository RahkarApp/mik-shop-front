'use client';

export default function CheckoutMethodChoices({title, name, options, selectedId, onChange, emptyMessage}) {
  return <fieldset className="space-y-3">
    <legend className="text-base font-bold text-gray-800 mb-2">{title}</legend>
    {options.length > 0 ? <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(option => <label key={option.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-colors ${!option.enabled ? 'cursor-not-allowed bg-gray-50 border-gray-100' : selectedId === option.id ? 'border-primary bg-primary/5 cursor-pointer' : 'border-gray-200 bg-white hover:border-primary/50 cursor-pointer'}`}>
          <input type="checkbox" name={name} value={option.id} checked={selectedId === option.id} disabled={!option.enabled} onChange={event => onChange(event.target.checked ? option.id : '')} className="mt-1 h-4 w-4 accent-primary shrink-0"/>
          <span className="min-w-0 flex flex-col gap-1"><span className="font-semibold text-sm text-gray-800">{option.name}</span>{option.description && <span className="text-xs text-gray-500 leading-relaxed">{option.description}</span>}{option.detail && <span className={`text-xs leading-relaxed ${option.enabled ? 'text-gray-600' : 'text-rose-600'}`}>{option.detail}</span>}</span>
        </label>)}
      </div>
    </> : <p role="status" className="text-sm text-amber-700 bg-amber-50 p-4 rounded-xl">{emptyMessage}</p>}
  </fieldset>;
}
