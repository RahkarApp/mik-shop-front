/**
 * ComponentBox — کامپوننت نمایشی فاز اول
 *
 * در فاز اول به جای UI واقعی، هر بخش با یک باکس رنگی
 * و عنوان نمایش داده می‌شود تا معماری Config-Driven تست شود.
 */

/**
 * @param {Object} props
 * @param {string} props.title — عنوان بخش (نام کامپوننت)
 * @param {string} [props.subtitle] — توضیح کوتاه اختیاری
 * @param {string} [props.color] — رنگ پس‌زمینه باکس
 * @param {string} [props.className] — کلاس‌های اضافی Tailwind
 */
export default function ComponentBox({
  title,
  subtitle,
  color = 'bg-violet-100 border-violet-400',
  className = '',
}) {
  return (
    // باکس اصلی — حاشیه و پدینگ برای خوانایی در تست معماری
    <div
      className={`w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2 min-h-[120px] ${color} ${className}`}
    >
      {/* عنوان اصلی بخش */}
      <span className="text-lg font-bold text-gray-800">{title}</span>

      {/* زیرعنوان اختیاری — مثلاً نام فروشگاه یا وضعیت Feature */}
      {subtitle && (
        <span className="text-sm text-gray-600">{subtitle}</span>
      )}
    </div>
  );
}
