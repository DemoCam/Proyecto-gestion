import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const emptyForm = {
  customerId: '',
  totalAmount: 0,
  status: 'REGISTERED',
  saleDate: new Date().toISOString().slice(0, 10),
  notes: '',
  items: [{ inventoryItemId: '', name: '', quantity: 1, unitPrice: 0 }],
};

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [salesRes, customersRes, inventoryRes] = await Promise.all([
        api.get('/sales'),
        api.get('/customers'),
        api.get('/inventory/items'),
      ]);
      setSales(salesRes.data);
      setCustomers(customersRes.data);
      setInventoryItems(inventoryRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('modal-open', showModal);

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal]);

  const openCreate = () => {
    const firstItem = inventoryItems[0];
    setForm({
      ...emptyForm,
      customerId: customers[0]?._id || '',
      items: [{
        inventoryItemId: firstItem?._id || '',
        name: firstItem?.name || '',
        quantity: 1,
        unitPrice: Number(firstItem?.salePrice || 0),
      }],
      totalAmount: Number(firstItem?.salePrice || 0),
    });
    setShowModal(true);
  };

  const calculateTotal = (items) => items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return sum + quantity * unitPrice;
  }, 0);

  const updateSaleItem = (index, changes) => {
    const items = form.items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...changes } : item
    ));
    setForm({ ...form, items, totalAmount: calculateTotal(items) });
  };

  const handleInventoryItemChange = (index, itemId) => {
    const selectedItem = inventoryItems.find((item) => item._id === itemId);
    const quantity = Number(form.items[index]?.quantity) || 1;
    const unitPrice = Number(selectedItem?.salePrice || 0);

    updateSaleItem(index, {
      inventoryItemId: itemId,
      name: selectedItem?.name || '',
      unitPrice,
      quantity,
    });
  };

  const handleQuantityChange = (index, value) => {
    const quantity = Number(value) || 1;
    updateSaleItem(index, { quantity });
  };

  const handleItemNameChange = (index, value) => {
    updateSaleItem(index, { name: value });
  };

  const addSaleItem = () => {
    const firstItem = inventoryItems[0];
    const newItem = {
      inventoryItemId: firstItem?._id || '',
      name: firstItem?.name || '',
      quantity: 1,
      unitPrice: Number(firstItem?.salePrice || 0),
    };
    const items = [...form.items, newItem];
    setForm({ ...form, items, totalAmount: calculateTotal(items) });
  };

  const removeSaleItem = (index) => {
    if (form.items.length === 1) return;
    const items = form.items.filter((_, itemIndex) => itemIndex !== index);
    setForm({ ...form, items, totalAmount: calculateTotal(items) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const items = form.items.map((item) => ({
        ...item,
        inventoryItemId: item.inventoryItemId,
        name: item.name || 'Venta comercial',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(
          inventoryItems.find((inventoryItem) => inventoryItem._id === item.inventoryItemId)?.salePrice ?? item.unitPrice ?? 0
        ),
      }));
      const totalAmount = calculateTotal(items);
      await api.post('/sales', {
        customerId: form.customerId,
        items,
        totalAmount,
        status: form.status,
        saleDate: new Date(form.saleDate).toISOString(),
        notes: form.notes,
      });
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Error registrando venta');
    }
  };

  const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
  const sortedSales = [...sales].sort((a, b) => {
    const firstDate = new Date(a.createdAt || a.saleDate || 0).getTime();
    const secondDate = new Date(b.createdAt || b.saleDate || 0).getTime();
    return secondDate - firstDate;
  });
  const getSaleItems = (sale) => sale.items?.length ? sale.items : [];
  const getProductId = (item) => {
    const inventoryItem = item?.inventoryItemId;
    if (!inventoryItem) return '-';
    return typeof inventoryItem === 'string' ? inventoryItem : inventoryItem.code || inventoryItem._id || '-';
  };
  const getProductIds = (sale) => {
    const productIds = getSaleItems(sale).map(getProductId).filter((id) => id !== '-');
    return productIds.length ? productIds.join(', ') : '-';
  };
  const getSaleDetail = (sale) => {
    const details = getSaleItems(sale).map((item) => `${item.name || 'Producto'} x${item.quantity || 1}`);
    return details.length ? details.join(', ') : sale.notes || '-';
  };

  return (
    <>
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-label">Registro Comercial</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary font-headline">Ventas Registradas</h2>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/10 hover:bg-primary-dim transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm font-bold">point_of_sale</span>
            Registrar Venta
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 font-label">Ventas Propias</p>
          <span className="text-2xl font-extrabold font-headline">{sales.length}</span>
        </div>
        <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1 font-label">Valor Registrado</p>
          <span className="text-2xl font-extrabold font-headline">${totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">ID Producto</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Detalle</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label text-right">Total</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {sortedSales.map((sale) => (
                <tr key={sale._id} className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">{new Date(sale.saleDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-on-surface">{sale.customerId?.fullName || 'Cliente'}</td>
                  <td className="px-6 py-4 text-xs font-mono text-primary">{getProductIds(sale)}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{getSaleDetail(sale)}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-primary">${Number(sale.totalAmount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-wider rounded-full">{sale.status}</span>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-on-surface-variant text-sm font-medium">Aún no tienes ventas registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center z-[999] px-3 pb-4 pt-24 sm:px-4 animate-fade-in">
          <div className="relative z-[1000] bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-2xl max-h-[calc(100vh-7rem)] animate-scale-in overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-outline-variant/15 flex items-center justify-between gap-3 shrink-0">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Registro Comercial</p>
                <h2 className="text-xl font-bold text-primary font-headline">Registrar Venta</h2>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Cerrar">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="font-body flex flex-col flex-1 min-h-0">
              <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Cliente" value={form.customerId} onChange={(value) => setForm({ ...form, customerId: value })} required>
                    <option value="">Seleccionar cliente...</option>
                    {customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.fullName}</option>)}
                  </Select>
                  <Field label="Fecha" type="date" value={form.saleDate} onChange={(value) => setForm({ ...form, saleDate: value })} required />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Productos</p>
                    <button type="button" onClick={addSaleItem} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-container text-on-primary-container rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-sm">add</span>
                      Agregar
                    </button>
                  </div>

                  {form.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 lg:grid-cols-[1.4fr_1.1fr_0.65fr_0.75fr_auto] gap-3 items-end p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                      <Select label="Insumo" value={item.inventoryItemId} onChange={(value) => handleInventoryItemChange(index, value)} required>
                        <option value="">Seleccionar insumo...</option>
                        {inventoryItems.map((inventoryItem) => (
                          <option key={inventoryItem._id} value={inventoryItem._id}>
                            {inventoryItem.code} - {inventoryItem.name} ({inventoryItem.currentStock} {inventoryItem.unit})
                          </option>
                        ))}
                      </Select>
                      <Field label="Detalle" value={item.name} onChange={(value) => handleItemNameChange(index, value)} required />
                      <Field label="Cantidad" type="number" value={item.quantity} onChange={(value) => handleQuantityChange(index, value)} required />
                      <Field label="Valor unitario" type="number" value={item.unitPrice} readOnly />
                      <button type="button" onClick={() => removeSaleItem(index)} disabled={form.items.length === 1} className="h-10 px-3 rounded-lg text-error hover:bg-error/10 disabled:opacity-40 disabled:hover:bg-transparent transition-colors" title="Quitar producto">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Estado" value={form.status} onChange={(value) => setForm({ ...form, status: value })}>
                    <option value="REGISTERED">Registrada</option>
                    <option value="CONFIRMED">Confirmada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </Select>
                  <Field label="Total" type="number" value={form.totalAmount} readOnly />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Notas</label>
                  <textarea className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-lg outline-none h-20 resize-none text-sm" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}></textarea>
                </div>

                <p className="text-xs text-on-surface-variant bg-primary-container/30 border border-primary/10 rounded-xl p-3 leading-relaxed mb-2">
                  La venta queda relacionada con el insumo seleccionado y descuenta automáticamente el stock del inventario.
                </p>
              </div>

              <ModalActions onCancel={() => setShowModal(false)} />
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, readOnly = false }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{label}</label>
      <input required={required} readOnly={readOnly} type={type} className={`w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-lg outline-none text-sm ${readOnly ? 'cursor-not-allowed text-on-surface-variant' : ''}`} value={value} onChange={(e) => onChange?.(e.target.value)} />
    </div>
  );
}

function Select({ label, value, onChange, children, required = false }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{label}</label>
      <select required={required} className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-lg outline-none text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </div>
  );
}

function ModalActions({ onCancel }) {
  return (
    <div className="relative z-10 px-5 py-4 border-t border-outline-variant/15 bg-surface-container-lowest flex justify-end gap-3 shrink-0 shadow-[0_-10px_24px_rgba(15,23,42,0.06)]">
      <button type="button" onClick={onCancel} className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
      <button type="submit" className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl shadow-md hover:bg-primary-dim transition-colors">Guardar</button>
    </div>
  );
}
