import Input from './Input';
import Select from './Select';
import { INDIAN_STATES } from '../../lib/constants';

/** `prefix` is the react-hook-form path, e.g. "address" or "billingAddress". */
export default function AddressFields({ prefix, register, errors = {} }) {
  const e = prefix.split('.').reduce((acc, k) => acc?.[k], errors) ?? {};
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Address line 1" required className="sm:col-span-2" autoComplete="address-line1" error={e.addressLine1?.message} {...register(`${prefix}.addressLine1`)} />
      <Input label="Address line 2" className="sm:col-span-2" autoComplete="address-line2" error={e.addressLine2?.message} {...register(`${prefix}.addressLine2`)} />
      <Input label="City" required autoComplete="address-level2" error={e.city?.message} {...register(`${prefix}.city`)} />
      <Select label="State" required error={e.state?.message} {...register(`${prefix}.state`)}>
        <option value="">Select state…</option>
        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      <Input label="PIN code" required inputMode="numeric" maxLength={6} autoComplete="postal-code" error={e.postalCode?.message} {...register(`${prefix}.postalCode`)} />
      <Input label="Country" required readOnly hint="The backend currently accepts India only." error={e.country?.message} {...register(`${prefix}.country`)} />
    </div>
  );
}
