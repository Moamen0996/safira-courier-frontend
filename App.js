const API_URL = window.CONFIG && window.CONFIG.API_URL ? window.CONFIG.API_URL : 'https://safira-admin-frontend-production.up.railway.app';

document.addEventListener('DOMContentLoaded', () => {
    loadAssignedShipments();
});

// جلب الشحنات المخصصة للمندوب
async function loadAssignedShipments() {
    const container = document.getElementById('courierShipmentsList');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/api/courier/shipments`);
        if (res.ok) {
            const shipments = await res.json();
            container.innerHTML = shipments.map(s => `
                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-3 flex justify-between items-center">
                    <div>
                        <h4 class="font-bold text-slate-800">${s.recipientName} (${s.governorate})</h4>
                        <p class="text-sm text-slate-500">الهاتف: ${s.recipientPhone} | العنوان: ${s.address}</p>
                        <p class="text-xs font-semibold text-safira-600 mt-1">المبلغ المطلوب تحصيله: ${s.price} ج.م</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="updateShipmentStatus('${s.id}', 'Delivered')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">تم التوصيل</button>
                        <button onclick="updateShipmentStatus('${s.id}', 'Postponed')" class="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">مؤجل</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// تحديث حالة الشحنة من قبل المندوب
async function updateShipmentStatus(shipmentId, newStatus) {
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
            alert('فشل في تحديث الحالة');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء الاتصال بالخادم');
    }
}