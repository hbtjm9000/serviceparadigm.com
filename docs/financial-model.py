#!/usr/bin/env python3
"""
Automata Financial Model
Run: python3 financial-model.py
Re-run when exhange rate, pricing, or salary assumptions change.
"""
# === INPUTS ===
usd_to_jmd = 155.0
take_home_target_usd = 60000.0
gross_tax_rate = 0.29
employer_burden_rate = 0.07
support_tech_gross_usd = 40000.0

# Desk pricing (JMD)
desk_pricing = {
    "single": {"onboard_jmd": 49000, "monthly_jmd": 45000},
    "multi": {"onboard_jmd": 89000, "monthly_jmd": 85000},
    "assembly_monthly_usd": 500,
}

# Customer mix assumption
mix = {"single": 0.60, "multi": 0.30, "assembly": 0.10}

# Profit First targets (for $0-$250K revenue band)
pf = {"profit": 0.05, "owner_pay": 0.50, "tax": 0.15, "opex": 0.30}

# === CALCULATIONS ===
gross_salary = take_home_target_usd / (1 - gross_tax_rate)
total_employer_cost = gross_salary * (1 + employer_burden_rate)
support_tech_cost = support_tech_gross_usd * (1 + employer_burden_rate)

s_mrr = desk_pricing["single"]["monthly_jmd"] / usd_to_jmd
m_mrr = desk_pricing["multi"]["monthly_jmd"] / usd_to_jmd
a_mrr = desk_pricing["assembly_monthly_usd"]
blended_mrr = s_mrr * mix["single"] + m_mrr * mix["multi"] + a_mrr * mix["assembly"]

print(f"\n{'='*60}")
print(f"  AUTOMATA FINANCIAL MODEL (JMD {usd_to_jmd:.0f}/USD)")
print(f"{'='*60}")
print(f"\nFounder cost:    ${total_employer_cost:>8,.0f}/year  (${total_employer_cost/12:>6,.0f}/mo)")
print(f"Support tech:    ${support_tech_cost:>8,.0f}/year  (${support_tech_cost/12:>6,.0f}/mo)")
print(f"Blended MRR:     ${blended_mrr:>8,.0f}/customer")
print(f"\n--- BREAKEVEN (Profit First) ---")
rev_needed = gross_salary / pf["owner_pay"]
print(f"Revenue needed:  ${rev_needed:>8,.0f}/year")
print(f"Customers:       {rev_needed / (blended_mrr * 12):>8.1f}")
print(f"\n--- BREAKEVEN (Founder + 1 support, MSP ratios) ---")
team_cost = total_employer_cost + support_tech_cost
rev_msp = team_cost / 0.33
print(f"Revenue needed:  ${rev_msp:>8,.0f}/year")
print(f"Customers:       {rev_msp / (blended_mrr * 12):>8.1f}")
print(f"\n--- RECOMMENDED PRICING SCENARIO ---")
rec_single = 59000 / usd_to_jmd
rec_multi = 115000 / usd_to_jmd
rec_blended = rec_single * 0.60 + rec_multi * 0.30 + 500 * 0.10
print(f"Rec Single MRR:  ${rec_single:>5,.0f}/mo")
print(f"Rec Multi MRR:   ${rec_multi:>5,.0f}/mo")
print(f"Rec Blended:     ${rec_blended:>5,.0f}/mo")
print(f"Customers @ PF:  {rev_needed / (rec_blended * 12):>5.1f}")
print(f"Customers @ MSP: {rev_msp / (rec_blended * 12):>5.1f}")
print(f"\n--- EXCHANGE RATE SENSITIVITY ---")
for rate in [140, 155, 170, 185]:
    print(f"  JMD {rate}/USD: Single=${desk_pricing['single']['monthly_jmd']/rate:.0f}  Multi=${desk_pricing['multi']['monthly_jmd']/rate:.0f}")
