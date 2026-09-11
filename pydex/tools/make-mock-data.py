"""Generate the committed mock datasets under data/mock. Deterministic (seeded)."""
import csv, json, random, os, datetime as dt
random.seed(20260911)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'data', 'mock')
os.makedirs(OUT, exist_ok=True)

products = [
  (101,'Kettle, 1.7 L','kitchen',39.00),(102,'Chef knife 20 cm','kitchen',64.00),
  (103,'Cast-iron skillet','kitchen',48.50),(104,'Desk lamp','office',29.90),
  (105,'Mechanical keyboard','office',119.00),(106,'Monitor arm','office',79.00),
  (107,'Trail shoes','outdoor',129.00),(108,'Rain shell','outdoor',159.00),
  (109,'Water bottle 1 L','outdoor',22.00),(110,'Yoga mat','fitness',34.00),
  (111,'Kettlebell 16 kg','fitness',59.00),(112,'Resistance bands','fitness',18.00),
]
with open(os.path.join(OUT,'products.json'),'w') as f:
  json.dump([{'id':i,'name':n,'category':c,'price':p} for i,n,c,p in products], f, indent=1)

regions = ['North','South','East','West']
reps = ['Amara','Bo','Chen','Dara','Eli','Farah']
start = dt.date(2025,1,1)
with open(os.path.join(OUT,'orders.csv'),'w',newline='') as f:
  w = csv.writer(f); w.writerow(['order_id','date','region','rep','product_id','quantity','unit_price','discount','status'])
  for i in range(1,241):
    d = start + dt.timedelta(days=random.randint(0,364))
    pid,name,cat,price = random.choice(products)
    q = random.choice([1,1,1,2,2,3,4,5])
    disc = random.choice([0,0,0,0,0.05,0.1,0.15])
    status = random.choices(['shipped','shipped','shipped','returned','cancelled'],[8,8,8,1,1])[0]
    w.writerow([1000+i, d.isoformat(), random.choice(regions), random.choice(reps), pid, q, price, disc, status])

with open(os.path.join(OUT,'employees.csv'),'w',newline='') as f:
  w = csv.writer(f); w.writerow(['id','name','team','city','hired','salary','remote'])
  rows = [
    (1,'Amara Okafor','Sales','Lagos','2019-03-11',72000,'yes'),(2,'Bo Lindqvist','Sales','Oslo','2021-07-01',68000,'no'),
    (3,'Chen Wei','Engineering','Singapore','2018-01-15',98000,'yes'),(4,'Dara Nazari','Engineering','Toronto','2022-09-19',91000,'yes'),
    (5,'Eli Brandt','Support','Berlin','2020-05-04',54000,'no'),(6,'Farah Haddad','Support','Amman','2023-02-27',51000,'yes'),
    (7,'Gus Moreno','Engineering','Madrid','2017-11-06',105000,'no'),(8,'Hana Sato','Design','Osaka','2021-01-18',77000,'yes'),
    (9,'Ivo Petrov','Design','Sofia','2019-08-12',73000,'no'),(10,'Jun Park','Sales','Seoul','2024-04-01',61000,'yes'),
  ]
  for r in rows: w.writerow(r)

html = """<!doctype html>
<html><head><title>Northwind Outfitters - catalogue</title></head>
<body>
<nav><a href="/">Home</a> <a href="/sale">Sale</a> <a href="/contact">Contact</a></nav>
<main>
<h1>Catalogue</h1>
<ul class="products">
""" + "\n".join(
  f'  <li class="product{" sale" if i%4==0 else ""}" data-id="{i}"><a href="/p/{i}">{n}</a> <span class="price">${p:.2f}</span> <span class="cat">{c}</span></li>'
  for i,n,c,p in products) + """
</ul>
<table id="stock">
<tr><th>id</th><th>in stock</th></tr>
""" + "\n".join(f'<tr><td>{i}</td><td>{random.randint(0,40)}</td></tr>' for i,_,_,_ in products) + """
</table>
<p class="note">Prices in USD. <em>Sale</em> items are marked.</p>
</main>
<footer><a href="mailto:hello@example.com">hello@example.com</a></footer>
</body></html>
"""
with open(os.path.join(OUT,'page.html'),'w') as f: f.write(html)
print('wrote', os.listdir(OUT))
