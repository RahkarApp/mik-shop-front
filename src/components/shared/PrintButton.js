'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 transition shadow-sm text-gray-700 font-medium"
        >
            <Printer size={16} /> چاپ فاکتور
        </button>
    );
}
