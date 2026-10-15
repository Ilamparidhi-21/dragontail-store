DRAGONTAIL Products — category and inventory filters

1. Upload ZIP to /home/ubuntu.
2. cd ~/dragontail
3. unzip -o ~/DRAGONTAIL-products-filters.zip -d ~/dragontail
4. python3 dt-product-filters/apply.py
5. npm run build
6. Only if build succeeds: pm2 restart dragontail --update-env && pm2 save

Adds category tabs (All, Men, Women, Accessories), visibility (All, Published, Hidden) and stock (All, In stock, Low stock 1–5 units, Out of stock) filters.
Filters use existing API inventory data. No database changes.
Script validates anchors before writing and backs up ProductsClient.tsx / products.css.
