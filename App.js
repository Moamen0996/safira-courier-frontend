// حماية من تكرار التعريف زي صفحة الادمن
window.API_URL = window.API_URL || (window.CONFIG && window.CONFIG.API_URL) || 'https://safira-admin-frontend-production.up.railway.app';
const API_URL = window.API_URL;

document.addEventListener('DOMContentLoaded', () => {
    loadAssignedShipments();
});

// جلب الشحنات المخصصة للمندوب
async function loadAssignedShipments() {
    const container = document.getElementById('courierShipmentsList');
    if (!container) return;

    container.innerHTML = '<p class="text-center text-slate-400 p-4">جاري تحميل الشحنات...</p>';

    // لو بتسجل دخول المندوب، هات الـ ID بتاعه من localStorage
    const courierId = localStorage.getItem('courierId') || 'current'; 

    try {
        // جرب الاتنين دول حسب الباك عندك - واحد منهم هيشتغل
        // لو الباك عندك بيعتمد على التوكن، استخدم السطر الاول
        // لو بيعتمد على ID، استخدم التاني
        const endpointsToTry = [
            `${API_URL}/api/shipments/assigned`, // الاغلب بيكون كده
            `${API_URL}/api/courier/shipments?courierId=${courierId}`,
            `${API_URL}/api/couriers/shipments`
        ];

        let shipments = [];
        for (const url of endpointsToTry) {
            const res = await fetch(url);
            if (res.ok) {
                shipments = await res.json();
                console.log('Shipments loaded from:', url, shipments);
                break;
            }
        }

        if (!shipments || shipments.length === 0) {
            container.innerHTML = '<p class="text-center text-slate-400 p-8 bg-white rounded-xl border">لا توجد شحنات مخصصة لك حالياً</p>';
            return;
        }

        container.innerHTML = shipments.map(s => `
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-3 flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                    <h4 class="font-bold text-slate-800">${s.recipientName || s.customerName} (${s.governorate || s.city})</h4>
                    <p class="text-sm text-slate-500">الهاتف: ${s.recipientPhone || s.phone} | العنوان: ${s.address}</p>
                    <p class="text-xs font-semibold text-safira-600 mt-1">المطلوب تحصيله: ${s.price || s.amount || s.cod} ج.م</p>
                    <span class="text-[10px] bg-slate-100 px-2 py-1 rounded mt-2 inline-block">${s.id}</span>
                </div>
                <div class="flex gap-2 self-end md:self-auto">
                    <button onclick="updateShipmentStatus('${s.id || s._id}', 'Delivered')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition">تم التوصيل ✓</button>
                    <button onclick="updateShipmentStatus('${s.id || s._id}', 'Postponed')" class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition">مؤجل</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p class="text-center text-red-500 p-4">خطأ في الاتصال بالسيرفر</p>';
    }
}

// تحديث حالة الشحنة من قبل المندوب
async function updateShipmentStatus(shipmentId, newStatus) {
    if(!confirm(`هل أنت متأكد من تغيير الحالة إلى: ${newStatus === 'Delivered' ? 'تم التوصيل' : 'مؤجل'}؟`)) return;

    try {
        const res = await fetch(`${API_URL}/api/shipments/${shipmentId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            alert('تم تحديث حالة الشحنة بنجاح');
            loadAssignedShipments();
        } else {
            const t = await res.text();
            alert('فشل في تحديث الحالة: ' + t);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء الاتصال بالخادم');
    }
}
