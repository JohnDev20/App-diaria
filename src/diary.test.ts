import { amountForType, formatCurrency, makeDiaryRecord, typeLabel } from './diary';

describe('regras de diárias', () => {
  it('calcula os três tipos de diária', () => {
    expect(amountForType(120, 'full')).toBe(120);
    expect(amountForType(120, 'half')).toBe(60);
    expect(amountForType(120, 'absence')).toBe(0);
  });

  it('mantém rótulos acessíveis e moeda brasileira', () => {
    expect(typeLabel('full')).toBe('Diária completa');
    expect(typeLabel('half')).toBe('Meia diária');
    expect(typeLabel('absence')).toBe('Falta');
    expect(formatCurrency(120)).toContain('120,00');
  });

  it('cria um registro determinístico para a data e tipo', () => {
    const record = makeDiaryRecord('2026-08-17', 120, 'full');
    expect(record.id).toBe('2026-08-17-full');
    expect(record.date).toBe('2026-08-17');
    expect(record.amount).toBe(120);
  });
});
