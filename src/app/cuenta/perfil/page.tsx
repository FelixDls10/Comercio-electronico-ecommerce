'use client';
import { useState } from 'react';
import { PROVINCES } from '@/lib/products';
import { useShop, useUI, type User } from '@/store/shop';
import { AccountShell } from '@/components/account/AccountShell';
import { Icon } from '@/components/Icons';
import { Reveal } from '@/components/Reveal';

function ProfileForm({ u }: { u: User }) {
  const updateUser = useShop((s) => s.updateUser);
  const notify = useUI((s) => s.notify);
  const [name, setName] = useState(u.name);
  const [phone, setPhone] = useState(u.phone);
  const [newsletter, setNewsletter] = useState(u.newsletter);
  const [addr, setAddr] = useState(u.address ?? { first: u.name.split(' ')[0] ?? '', last: u.name.split(' ').slice(1).join(' '), email: u.email, phone: u.phone, address: '', city: '', prov: PROVINCES[0] });
  const f = (k: keyof typeof addr, label: string, full = false) => (
    <div className={`field ${full ? 'full' : ''}`}>
      <input id={`a-${k}`} placeholder=" " value={addr[k] ?? ''} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} />
      <label htmlFor={`a-${k}`}>{label}</label>
    </div>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); updateUser({ name, phone, newsletter, address: addr.address ? addr : undefined }); notify(<><Icon.check /><span>Perfil actualizado</span></>); }}>
      <Reveal className="panel">
        <h3>Datos personales</h3>
        <div className="fields">
          <div className="field"><input id="p-name" placeholder=" " value={name} onChange={(e) => setName(e.target.value)} /><label htmlFor="p-name">Nombre completo</label></div>
          <div className="field"><input id="p-phone" placeholder=" " value={phone} onChange={(e) => setPhone(e.target.value)} /><label htmlFor="p-phone">Teléfono</label></div>
          <div className="field full"><input id="p-email" placeholder=" " value={u.email} disabled /><label htmlFor="p-email">Correo electrónico</label></div>
        </div>
        <label className="check"><input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} /> Recibir novedades del Club Royale</label>
      </Reveal>
      <Reveal className="panel">
        <h3>Dirección de envío</h3>
        <div className="fields">
          {f('first', 'Nombre')}{f('last', 'Apellido')}{f('address', 'Calle, número y sector', true)}{f('city', 'Ciudad')}
          <div className="field">
            <select id="a-prov" value={addr.prov} onChange={(e) => setAddr({ ...addr, prov: e.target.value })}>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select>
            <label htmlFor="a-prov">Provincia</label>
          </div>
        </div>
      </Reveal>
      <button className="btn" type="submit">Guardar cambios</button>
    </form>
  );
}

export default function PerfilPage() {
  return <AccountShell title={<>Perfil y <em>dirección</em></>}>{(u) => <ProfileForm u={u} />}</AccountShell>;
}
