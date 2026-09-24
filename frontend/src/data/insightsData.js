// Illustrative placeholders only. Swap these for real aggregates computed
// from your training dataset (e.g. a small /api/insights endpoint, or a
// notebook export) once available — see the note on the Insights page.

export const defaultRateByEmployment = [
  { label: 'Full-time', value: 0.09 },
  { label: 'Part-time', value: 0.17 },
  { label: 'Self-employed', value: 0.15 },
  { label: 'Unemployed', value: 0.34 },
]

export const defaultRateByCreditBand = [
  { label: '300–579', value: 0.41 },
  { label: '580–669', value: 0.24 },
  { label: '670–739', value: 0.12 },
  { label: '740–799', value: 0.06 },
  { label: '800–850', value: 0.02 },
]

export const defaultRateByDti = [
  { label: '<0.2', value: 0.05 },
  { label: '0.2–0.35', value: 0.11 },
  { label: '0.35–0.5', value: 0.22 },
  { label: '>0.5', value: 0.38 },
]

export const featureImportance = [
  { label: 'Credit score', value: 0.28 },
  { label: 'DTI ratio', value: 0.22 },
  { label: 'Interest rate', value: 0.16 },
  { label: 'Loan / income', value: 0.14 },
  { label: 'Employment length', value: 0.11 },
  { label: 'Other', value: 0.09 },
]

export const summaryStats = {
  totalApplications: '12,480',
  overallDefaultRate: '13.4%',
  avgCreditScore: 668,
  avgLoanAmount: '$18,240',
}
