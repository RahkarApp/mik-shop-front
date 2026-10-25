import CheckoutClient from "@/components/shared/CheckoutClient";

export const metadata = {
    title: "تسویه حساب | شاپ‌ساز",
    description: "تکمیل فرآیند خرید و پرداخت نهایی",
};

export default function CheckoutPage() {
    return (
        <main className="min-h-screen bg-gray-50/50">
            <CheckoutClient />
        </main>
    );
}
