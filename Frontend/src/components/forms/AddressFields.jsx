import { Input, Select } from '../ui/FormField.jsx'
import { COUNTRIES, STATES } from '../../config/enums.js'

/** Register-based address block. `prefix` is the field path, for example "billingAddress". */
export function AddressFields({ prefix, register, errors = {}, legend }) {
  const e = (name) => errors?.[name]?.message
  return (
    <fieldset className="form-grid" style={{ border: 0, padding: 0, margin: 0, minInlineSize: 0 }}>
      {legend && <legend className="label" style={{ marginBlockEnd: 8 }}>{legend}</legend>}
      <Input wrapperClassName="span-2" label="Address line 1" autoComplete="address-line1" error={e('addressLine1')} {...register(`${prefix}.addressLine1`)} />
      <Input wrapperClassName="span-2" label="Address line 2" optional autoComplete="address-line2" error={e('addressLine2')} {...register(`${prefix}.addressLine2`)} />
      <Input label="City" autoComplete="address-level2" error={e('city')} {...register(`${prefix}.city`)} />
      <Select label="State" autoComplete="address-level1" error={e('state')} {...register(`${prefix}.state`)}>
        <option value="">Choose a state</option>
        {STATES.map((s) => <option key={s}>{s}</option>)}
      </Select>
      <Input label="Postal code" inputMode="numeric" autoComplete="postal-code" maxLength={6} error={e('postalCode')} {...register(`${prefix}.postalCode`)} />
      <Select label="Country" autoComplete="country-name" error={e('country')} {...register(`${prefix}.country`)}>
        {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
      </Select>
    </fieldset>
  )
}
