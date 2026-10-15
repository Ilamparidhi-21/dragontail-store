DRAGONTAIL — variant image consistency & homepage cleanup

Run from ~/dragontail:
  unzip -o ~/DRAGONTAIL-cart-variant-and-collections-cleanup.zip -d ~/dragontail
  python3 dt-variant-cart-cleanup/apply.py
  npm run build
  # only after success: pm2 restart dragontail --update-env && pm2 save

Changes:
- Bag thumbnail uses current cart line color and matching colorImages[<color>][0].
- Checkout quote uses PostgreSQL color_images for the requested selected color.
- Customer order history & detail queries use the stored order item color against the product's color_images.
- Removes the Shop with intention showcase section; Shop All collection filters remain.

Safety:
- No SQL migration or edits to database records.
- A timestamped source backup is created before writing files.
- Validates file anchors before changes.
- If product image data or color image assignment is missing, falls back to the primary product photo.
- Does not create a permanent image snapshot in the order item: changes to product photos later can affect old order thumbnails.
