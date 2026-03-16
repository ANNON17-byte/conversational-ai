"""
Seed the database with sample sales data for demo purposes.
Run: python seed_data.py
"""
import pandas as pd
import numpy as np
from app.database.db import engine, Base

np.random.seed(42)

# ── Generate realistic sales data ──────────────────────────────────────

regions = ["East", "West", "North", "South"]
products = ["Laptops", "Phones", "Tablets", "Accessories", "Software"]
categories = ["Electronics", "Electronics", "Electronics", "Accessories", "Software"]

rows = []
for year in [2024, 2025]:
    for month in range(1, 13):
        for region in regions:
            for i, product in enumerate(products):
                base_revenue = np.random.randint(10000, 80000)
                # Add seasonal trends
                seasonal = 1.0 + 0.3 * np.sin(2 * np.pi * month / 12)
                revenue = round(base_revenue * seasonal, 2)
                units = np.random.randint(50, 500)
                cost = round(revenue * np.random.uniform(0.4, 0.7), 2)
                profit = round(revenue - cost, 2)

                rows.append({
                    "date": f"{year}-{month:02d}-01",
                    "year": year,
                    "month": month,
                    "quarter": f"Q{(month - 1) // 3 + 1}",
                    "region": region,
                    "product": product,
                    "category": categories[i],
                    "revenue": revenue,
                    "units_sold": units,
                    "cost": cost,
                    "profit": profit,
                    "customer_count": np.random.randint(20, 200),
                })

df = pd.DataFrame(rows)

# ── Write to SQLite ────────────────────────────────────────────────────

Base.metadata.create_all(bind=engine)
df.to_sql("sales", engine, if_exists="replace", index=False)

print(f"Seeded {len(df)} rows into 'sales' table.")
print(f"Columns: {list(df.columns)}")
print(f"\nSample data:")
print(df.head(10).to_string(index=False))
print(f"\nSchema ready for AI dashboard queries!")
print(f"\nExample queries you can try:")
print('  - "Show total revenue by region"')
print('  - "Show monthly revenue trend for 2025"')
print('  - "What are the top 5 products by profit?"')
print('  - "Show quarterly sales for East region"')
print('  - "Compare revenue vs cost by product category"')
